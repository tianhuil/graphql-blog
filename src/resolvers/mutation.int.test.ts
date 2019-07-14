import { graphql } from 'graphql'
import { makeSchema } from '../schema'
import { prisma } from '../generated/prisma-client'
import { Auth } from '../auth';
import { Ctx } from '../types';

describe('Test Mutations', () => {
  const context: Ctx = { prisma, auth: new Auth() }
  const schema = makeSchema()

  const userData = {
    email: "bob@example.com",
    password: "password",
    name: "Bob"
  }

  const draftPost = {
    title: "Title",
    text: "Text",
  }

  async function queryValidResults(source: string, variables: object): Promise<any> {
    const result = await graphql(schema, source, null, context, variables)
    expect(result.errors).toBeUndefined()
    expect(result.data).toBeTruthy()
    return result.data
  }

  afterAll(async () => {
    // Must be run in serial for relationship invariant to hold
    prisma.deleteManyPosts()
    prisma.deleteManyUsers()
  })

  test('Test signup', async () => {    
    const signupData = await queryValidResults(`
    mutation Signup($data: SignupInput) {
      signup(data: $data) {
        token
        user {
          id
          createdAt
          name
        }
      }
    }`, {data: userData})

    expect(signupData.signup.user.name).toEqual(userData.name)
    expect(signupData.signup.user.id).toBeTruthy()
  })

  test('Test Create Draft', async () => {
    const user = await prisma.createUser(userData)

    const createDraftData = await queryValidResults(`
    mutation CreateDraft($data: CreateDraftInput) {
      createDraft(data: $data) {
        id
        createdAt
        title
        published
      }
    }`, {data: { ...draftPost, authorId: user.id}})

    expect(createDraftData!.createDraft.title).toEqual(draftPost.title)
    expect(createDraftData!.createDraft.published).toBe(false)
    const postId = createDraftData!.createDraft.id
    expect( postId ).toBeTruthy()
  })

  test('Test Publish Draft', async() => {
    const post = await prisma.createPost({
      ...draftPost,
      published: false,
      author: {
        create: userData
      }
    })

    const publishDraftData = await queryValidResults(`
    mutation PublishDraft($id: ID) {
      publishDraft(id: $id) {
        id
        published
      }
    }`, {id: post.id})

    expect(publishDraftData.publishDraft.id).toEqual(post.id)
    expect(publishDraftData.publishDraft.published).toEqual(true)
  })

  test('Test Delete Draft', async() => {
    const post = await prisma.createPost({
      ...draftPost,
      author: {
        create: userData
      }
    })

    const deletePostData = await queryValidResults(`
    mutation DeletePost($id: ID) {
      deletePost(where: { id: $id }) {
        id
      }
    }`, {id: post.id})

    expect(deletePostData.deletePost.id).toEqual(post.id)

    const postData = await queryValidResults(`
    query Post($id: ID){
      post(id: $id) {
        id
      }
    }`, {id: post.id})

    expect(postData.post).toBeNull()
  })
})
