import { prisma, Post } from '../generated/prisma-client'
import { mockContext, queryExpectError, queryValidateResults } from '../test-helpers';
import { Auth } from '../lib/auth';

describe('Test Mutations', () => {
  const auth = new Auth()
  
  const userData = {
    email: "bob@example.com",
    password: auth.hashSync("password"),
    name: "Bob",
  }

  const context = mockContext({})

  const loginData = (({email, password}) => ({email, password}))(userData)

  const draftPost = {
    title: "Title",
    text: "Text",
  }

  beforeEach(async () => {
    // Must be run in serial for relationship invariant to hold
    await prisma.deleteManyPosts()
    await prisma.deleteManyUsers()
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

  test('Test Create Draft', async () => {
    const user = await prisma.createUser(userData)

    const createDraftData = await queryValidateResults(`
    mutation CreateDraft($data: CreateDraftInput) {
      createDraft(data: $data) {
        id
        createdAt
        title
        published
      }
    }`, {data: { ...draftPost, authorId: user.id}}, mockContext({userId: user.id}))

    expect(createDraftData!.createDraft.title).toEqual(draftPost.title)
    expect(createDraftData!.createDraft.published).toBe(false)
    const postId = createDraftData!.createDraft.id
    expect( postId ).toBeTruthy()
  })

  test('Test Publish Draft', async() => {
    const user = await prisma.createUser(userData)
    const post = await prisma.createPost({
      ...draftPost,
      published: false,
      author: {
        connect: {
          id: user.id
        }
      }
    })

    const publishDraftData = await queryValidateResults(`
    mutation PublishDraft($id: ID) {
      publishDraft(where: {id: $id}) {
        id
        published
      }
    }`, {id: post.id}, mockContext({userId: user.id}))

    expect(publishDraftData.publishDraft.id).toEqual(post.id)
    expect(publishDraftData.publishDraft.published).toEqual(true)
  })

  test('Test Delete Draft', async() => {
    const user = await prisma.createUser(userData)
    const post = await prisma.createPost({
      ...draftPost,
      published: false,
      author: {
        connect: {
          id: user.id
        }
      }
    })

    const deletePostData = await queryValidateResults(`
    mutation DeletePost($id: ID) {
      deletePost(where: { id: $id }) {
        id
      }
    }`, {id: post.id}, mockContext({userId: user.id}))

    expect(deletePostData.deletePost.id).toEqual(post.id)

    expect(await prisma.post({id: post.id})).toBeNull()
  })
})
