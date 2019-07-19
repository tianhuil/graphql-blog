import * as hashFunction from 'object-hash'
import { prisma, User, Post } from '../generated/prisma-client'
import { middleware } from 'graphql-middleware'
import { isAuthenticated, isAuthor, isPublished, permissions } from './permissions'
import { queryValidateResults, mockContext } from '../test-helpers';
import { makeSchema } from '../server/schema';
import { IShieldContext, IOptions, IRule } from 'graphql-shield/dist/types';
import { isatty } from 'tty';
import { Rule } from 'graphql-shield/dist/rules';

describe('Test Permissions', () => {
  const userData = {
    email: "permissions@example.com",
    password: "password",
    name: "Permissions",
  }

  const postData = {
    title: "Permissions",
    text: "Permissions",
    published: false,
  }

  let userId = ""
  let postId = ""

  beforeAll(async() => {
    try {
      const user = await prisma.createUser({
        ...userData
      })
      userId = user.id
      const post = await prisma.createPost({
        ...postData,
        author: {
          connect: { id: userId }
        }
      })
      postId = post.id
    } catch(e) {
      // const errMessage = e.errors[0].message
      // "A unique constraint would be violated on User. Details: Field name = email"
      console.warn("User Already exists")
    }
  })

  type ResolverArgs = {
    userId?: string,
    postId?: string
  }

  async function applyResolver(
    resolver: Rule,
    resolverArgs: ResolverArgs
  ) {
    const {userId, postId} = resolverArgs

    const shieldContext: IShieldContext = {
      _shield: {
        cache: {},
        hashFunction
      }
    }
    const Options: jest.Mock<IOptions> = jest.fn()
    
    const context = {
      ...mockContext({userId}),
      ...shieldContext,
    }
    const args = postId ? { where: { id: postId } } : {}

    return resolver.resolve({}, args,
      context,
      {},
      new Options()
    )
  }

  test('Test isAuthenticated', async() => {
    expect(await applyResolver(isAuthenticated, {})).toBeFalsy()
    expect(await applyResolver(isAuthenticated, { userId: "not the key"})).toBeFalsy()
    expect(await applyResolver(isAuthenticated, { userId })).toBeTruthy()
  })

  test('Test isAuthor', async() => {
    expect(await applyResolver(isAuthor, {})).toBeFalsy()
    expect(await applyResolver(isAuthor, { userId })).toBeFalsy()
    expect(await applyResolver(isAuthor, { postId })).toBeFalsy()
    expect(await applyResolver(isAuthor, { userId, postId, })).toBeTruthy()
  })

  afterAll(async() => {
    await prisma.deletePost({id: postId})
    await prisma.deleteUser({id: userId})
  })
})
