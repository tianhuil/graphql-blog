import * as hashFunction from 'object-hash'
import { IShieldContext, IOptions } from 'graphql-shield/dist/types';
import { Rule } from 'graphql-shield/dist/rules';

import { prisma } from '../generated/prisma-client'
import { isAuthenticated, isAuthor, isPublished } from './permissions'
import { mockContext, TestDataBase } from '../test-helpers';


class TestData extends TestDataBase {
  private userDatum = {
    email: "permissions@example.com",
    password: "password",
    name: "Permissions",
  }

  private postData = [{
    title: "Permissions 1",
    text: "Permissions 1",
    published: false,
  }, {
    title: "Permissions 2",
    text: "Permissions 2",
    published: true,
  }]

  async setUp() {
    this.userIds = [await this.findCreateUser(this.userDatum)]
    this.postIds = await Promise.all(
      this.postData.map(
        postDatum => this.createConnectPost({
          ...postDatum,
          author: {
            connect: { id: this.userIds[0] }
          }
        })
      )
    )
  }

  getUserId() {
    return this.userIds[0]
  }

  getUnpublishedPostId() {
    return this.postIds[0]
  }

  getPublishedPostId() {
    return this.postIds[1]
  }

  getPostIds() {
    return this.postIds
  }
}

describe('Test Permissions', () => {
  const testData = new TestData(prisma)

  beforeAll(async() => {
    await testData.setUp()
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
    expect(await applyResolver(isAuthenticated, { userId: testData.getUserId() })).toBeTruthy()
  })

  test('Test isAuthor', async() => {
    const userId = testData.getUserId()
    expect(await applyResolver(isAuthor, {})).toBeFalsy()
    expect(await applyResolver(isAuthor, { userId })).toBeFalsy()
    testData.getPostIds().forEach(async postId => {
      expect(await applyResolver(isAuthor, { postId })).toBeFalsy()
      expect(await applyResolver(isAuthor, { userId, postId })).toBeTruthy()
    })
  })

  test('Test isPublished', async() => {
    expect(await applyResolver(isPublished, {})).toBeFalsy()
    expect(await applyResolver(isPublished, { postId: testData.getUnpublishedPostId() })).toBeFalsy()
    expect(await applyResolver(isPublished, { postId: testData.getPublishedPostId() })).toBeTruthy()
  })

  afterAll(async () => {
    await testData.tearDown()
  })
})
