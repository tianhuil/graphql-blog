import * as hashFunction from 'object-hash'
import { prisma, Post } from '../generated/prisma-client'
import { isAuthenticated, isAuthor, isPublished } from './permissions'
import { mockContext } from '../test-helpers';
import { IShieldContext, IOptions } from 'graphql-shield/dist/types';
import { Rule } from 'graphql-shield/dist/rules';

describe('Test Permissions', () => {
  const userData = {
    email: "permissions@example.com",
    password: "password",
    name: "Permissions",
  }

  const postData = [{
    title: "Permissions 1",
    text: "Permissions 1",
    published: false,
  }, {
    title: "Permissions 2",
    text: "Permissions 2",
    published: true,
  }]

  let userId = ""
  let postIds: string[] = []

  beforeAll(async() => {
    try {
      const user = await prisma.createUser({
        ...userData
      })
      userId = user.id
    } catch(e) {
      const user = await prisma.user({email: userData.email})
      // const errMessage = e.errors[0].message
      // "A unique constraint would be violated on User. Details: Field name = email"
      console.warn("User Already exists")
      userId = user!.id
    }
    const posts: Post[] = await Promise.all(
      postData.map(postDatum => prisma.createPost({
      ...postDatum,
      author: {
        connect: { id: userId }
      }
    }))
  )
  postIds = posts.map(post => post.id)
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
    console.log(userId)
    expect(await applyResolver(isAuthenticated, { userId })).toBeTruthy()
  })

  test('Test isAuthor', async() => {
    expect(await applyResolver(isAuthor, {})).toBeFalsy()
    expect(await applyResolver(isAuthor, { userId })).toBeFalsy()
    postIds.forEach(async postId => {
      expect(await applyResolver(isAuthor, { postId })).toBeFalsy()
      expect(await applyResolver(isAuthor, { userId, postId })).toBeTruthy()
    })
  })

  test('Test isPublished', async() => {
    expect(await applyResolver(isPublished, {})).toBeFalsy()
    expect(await applyResolver(isPublished, { postId: postIds[0] })).toBeFalsy()
    expect(await applyResolver(isPublished, { postId: postIds[1] })).toBeTruthy()
  })

  afterAll(async() => {
    await Promise.all(postIds.map(postId =>
      prisma.deletePost({id: postId})
    ))
    await prisma.deleteUser({id: userId})
  })
})
