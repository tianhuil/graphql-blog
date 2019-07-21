import { prisma } from '../generated/prisma-client'
import { mockContext, queryExpectError, queryValidateResults, TestDataBase } from '../test-helpers';

describe('Test Login', () => {
  const userData = {
    email: "login@example.com",
    password: "Login",
    name: "Login",
  }
  const loginData = (({email, password}) => ({email, password}))(userData)
  const context = mockContext({})

  beforeEach(async () => {
    await prisma.deleteManyUsers({email: userData.email})
  })

  test('Test signup and login', async () => {
    const signupData = await queryValidateResults(`
    mutation Signup($data: SignupInput) {
      signup(data: $data) {
        token
        user {
          id
          createdAt
          name
        }
      }
    }`, {data: userData}, context)

    expect(signupData.signup.user.name).toEqual(userData.name)
    expect(signupData.signup.user.id).toBeTruthy()

    const loginQuery = `
    mutation Login($data: LoginInput) {
      login(data: $data) {
        token
        user {
          id
          createdAt
          name
        }
      }
    }`

    await queryExpectError(
      loginQuery,
      {data: { ...loginData, password: "bad password"}},
      context
    )

    await queryValidateResults(
      loginQuery,
      {data: loginData},
      context
    )
  })

  test('Test signup and me', async () => {
    const signupData = await queryValidateResults(`
    mutation Signup($data: SignupInput) {
      signup(data: $data) {
        token
        user {
          id
          createdAt
          name
        }
      }
    }`, {data: userData}, context)

    expect(signupData.signup.user.name).toEqual(userData.name)
    expect(signupData.signup.user.id).toBeTruthy()

    await queryExpectError(`
      query {
        me {
          id
        }
      }`,
      {},
      context,
    )

    const meData = await queryValidateResults(`
      query {
        me {
          id
        }
      }`,
      {},
      mockContext({token: signupData.signup.token})
    )

    expect(meData.me.id).toEqual(signupData.signup.user.id)
  })
})

describe('Test Draft Mutations', () => {  
  const userData = {
    email: "bob@example.com",
    password: "password",
    name: "Bob",
  }

  const loginData = (({email, password}) => ({email, password}))(userData)

  const draftPost = {
    title: "Title",
    text: "Text",
    published: false,
  }

  const context = mockContext({})

  class TestData extends TestDataBase {
    async setUp() {
      this._userIds = [await this.findCreateUser(userData)]
      this._postIds = [await this.createConnectPost({
        ...draftPost,
        author: {
          connect: { id: this._userIds[0]}
        }
      })]
    }

    get userId() {
      return this._userIds[0]
    }
  
    get postId() {
      return this._postIds[0]
    }
  }

  const testData = new TestData(prisma)

  beforeAll(async () => {
    await testData.setUp()
  })

  afterAll(async () => {
    await testData.tearDown()
  })

  test('Test Create Draft', async () => {
    const userId = testData.userId

    const createdDraftData = await queryValidateResults(`
    mutation CreateDraft($data: CreateDraftInput) {
      createDraft(data: $data) {
        id
        createdAt
        title
        published
      }
    }`, {data: { title: draftPost.title }}, mockContext({userId}))

    expect(createdDraftData!.createDraft.title).toEqual(draftPost.title)
    expect(createdDraftData!.createDraft.published).toBe(false)
    const postId = createdDraftData!.createDraft.id
    expect( postId ).toBeTruthy()
  })

  test('Test Publish Draft', async() => {
    const userId = testData.userId
    const postId = testData.postId

    const publishDraftData = await queryValidateResults(`
    mutation PublishDraft($id: ID) {
      publishDraft(where: {id: $id}) {
        id
        published
      }
    }`, {id: postId}, mockContext({userId}))

    expect(publishDraftData.publishDraft.id).toEqual(postId)
    expect(publishDraftData.publishDraft.published).toEqual(true)
  })

  test('Test Delete Draft', async() => {
    const userId = testData.userId
    const postId = testData.postId

    const deletePostData = await queryValidateResults(`
    mutation DeletePost($id: ID) {
      deletePost(where: { id: $id }) {
        id
      }
    }`, {id: postId}, mockContext({userId}))

    expect(deletePostData.deletePost.id).toEqual(postId)

    expect(await prisma.post({id: postId})).toBeNull()
  })
})
