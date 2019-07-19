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

  beforeAll(async() => {
    try {
      await prisma.createUser({
        ...userData,
        posts: {
          create: [postData]
        }
      })
    } catch(e) {
      // const errMessage = e.errors[0].message
      // "A unique constraint would be violated on User. Details: Field name = email"
      console.warn("User Already exists")
    }
  })

  async function getUser(): Promise<User> {
    return (await prisma.user({email: userData.email}))!
  }

  async function getPost(): Promise<Post> {
    const posts = await prisma.posts({where: {title: postData.title}})
    return posts[0]
  }

  async function getUserPost(): Promise<[User, Post]> {
    return Promise.all([
      getUser(),
      getPost(),
    ])
  }

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

  test('Test User', async() => {
    const user = await getUser()
    expect(user).toHaveProperty("name", userData.name)
    expect(user).toHaveProperty("id")
  })

  test('Test isAuthenticated', async() => {
    const user = await getUser()
    expect(await applyResolver(isAuthenticated, {})).toBeFalsy()
    expect(await applyResolver(isAuthenticated, { userId: "not the key"})).toBeFalsy()
    expect(await applyResolver(isAuthenticated, { userId: user.id })).toBeTruthy()
  })

  test('Test isAuthor', async() => {
    const [user, post] = await getUserPost()
    expect(await applyResolver(isAuthor, {})).toBeFalsy()
    expect(await applyResolver(isAuthor, { userId: user.id })).toBeFalsy()
    expect(await applyResolver(isAuthor, { postId: post.id })).toBeFalsy()
    expect(await applyResolver(isAuthor, { userId: user.id, postId: post.id, })).toBeTruthy()
  })

  afterAll(async() => {
    const [user, post] = await getUserPost()
    await prisma.deletePost({id: post.id})
    await prisma.deleteUser({id: user!.id})
  })
})
