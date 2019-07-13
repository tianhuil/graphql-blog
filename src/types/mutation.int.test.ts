import { graphql } from 'graphql'
import { schema } from '../schema'
import { prisma } from '../generated/prisma-client'

describe('Test Mutations', () => {
  const context = { prisma }

  const userData = {
    email: "bob@example.com",
    password: "password",
    name: "Bob"
  }

  const draftData = {
    title: "Title",
    text: "Text",
    published: false,
  }

  async function queryValidResults(source: string, variables: object): Promise<any> {
    const result = await graphql(schema, source, null, context, variables)
    expect(result.errors).toBeUndefined()
    expect(result.data).toBeTruthy()
    return result.data
  }

  beforeAll(async () => {
    // Must be run in serial for relationship invariant to hold
    prisma.deleteManyPosts()
    prisma.deleteManyUsers()
  })

  test('Test signup', async () => {    
    const signupData = await queryValidResults(`
    mutation Signup($data: signupInput) {
      signup(data: $data) {
        id
        createdAt
        name
      }
    }`, {data: userData})

    expect(signupData.signup.name).toEqual(userData.name)
    expect(signupData.signup.id).toBeTruthy()
  })

  test('Test Create Draft', async () => {
    const user = await prisma.createUser(userData)

    const createDraftData = await queryValidResults(`
    mutation CreateDraft($data: createDraftInput) {
      createDraft(data: $data) {
        id
        createdAt
        title
        published
      }
    }`, {data: draftData})

    expect(createDraftData!.createDraft.title).toEqual("Title")
    expect(createDraftData!.createDraft.published).toBe(false)
    const postId = createDraftData!.createDraft.id
    expect( postId ).toBeTruthy()
  })

  test('Test Publish Draft', async() => {
    const post = await prisma.createPost({
      ...draftData,
      author: {
        create: userData
      }
    })

    const publishDraftData = await queryValidResults(`
    mutation {
      publishDraft(id: "${post.id}") {
        id
        published
      }
    }`, {})

    expect(publishDraftData.publishDraft.id).toEqual(post.id)
    expect(publishDraftData.publishDraft.published).toEqual(true)
  })

  test('Test Delete Draft', async() => {
    const post = await prisma.createPost({
      ...draftData,
      author: {
        create: userData
      }
    })

    const deletePostData = await queryValidResults(`
    mutation {
      deletePost(where: { id: "${post.id}" }) {
        id
      }
    }`, {})

    expect(deletePostData.deletePost.id).toEqual(post.id)

    const postData = await queryValidResults(`
    query {
      post(id: "${post.id}") {
        id
      }
    }`, {})

    expect(postData.post).toBeNull()
  })
})
