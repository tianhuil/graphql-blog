import * as hashFunction from 'object-hash'
import { IShieldContext, IOptions } from 'graphql-shield/dist/types';
import { Rule } from 'graphql-shield/dist/rules';

import { prisma } from '../generated/prisma-client'
import { isAuthenticated, isAuthor, isPublished } from './permissions'
import { mockContext, TestDataBase } from "../tests"


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
    this._userIds = [await this.findCreateUser(this.userDatum)]
    this._postIds = await Promise.all(
      this.postData.map(
        postDatum => this.createConnectPost({
          ...postDatum,
          author: {
            connect: { id: this._userIds[0] }
          }
        })
      )
    )
  }

  get userId() {
    return this._userIds[0]
  }

  get unpublishedPostId() {
    return this._postIds[0]
  }

  get publishedPostId() {
    return this._postIds[1]
  }

  get postIds() {
    return this._postIds
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
    expect(await applyResolver(isAuthenticated, { userId: testData.userId })).toBeTruthy()
  })

  test('Test isAuthor', async() => {
    const { userId } = testData
    expect(await applyResolver(isAuthor, {})).toBeFalsy()
    expect(await applyResolver(isAuthor, { userId })).toBeFalsy()
    testData.postIds.forEach(async postId => {
      expect(await applyResolver(isAuthor, { postId })).toBeFalsy()
      expect(await applyResolver(isAuthor, { userId, postId })).toBeTruthy()
    })
  })

  test('Test isPublished', async() => {
    const { unpublishedPostId, publishedPostId } = testData
    expect(await applyResolver(isPublished, {})).toBeFalsy()
    expect(await applyResolver(isPublished, { postId: unpublishedPostId })).toBeFalsy()
    expect(await applyResolver(isPublished, { postId: publishedPostId })).toBeTruthy()
  })

  afterAll(async () => {
    await testData.tearDown()
  })
})
