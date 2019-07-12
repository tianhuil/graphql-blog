import { graphql } from 'graphql'

import { schema } from '../schema'
import { prisma } from '../generated/prisma-client'

describe('Test Mutations', () => {
  const context = { prisma }

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

  test('Test signUp, create, and delete', async () => {    
    const signUpData = await queryValidResults(`
    mutation {
      signUp(email: "example@example.com", password: "password", name: "Bob") {
        id
        createdAt
        name
      }
    }`, {})

    expect(signUpData.signUp.name).toEqual("Bob")
    const authorId = signUpData.signUp.id
    expect(authorId).toBeTruthy()

    const createDraftData = await queryValidResults(`
    mutation {
      createDraft(title: "Title", authorId: "${authorId}") {
        id
        createdAt
        title
        published
      }
    }`, {})

    expect(createDraftData!.createDraft.title).toEqual("Title")
    expect(createDraftData!.createDraft.published).toBe(false)
    const postId = createDraftData!.createDraft.id
    expect( postId ).toBeTruthy()

    const publishDraftData = await queryValidResults(`
    mutation {
      publishDraft(id: "${postId}") {
        id
        published
      }
    }`, {})

    expect(publishDraftData.publishDraft.id).toEqual(postId)
    expect(publishDraftData.publishDraft.published).toEqual(true)

    const deletePostData = await queryValidResults(`
    mutation {
      deletePost(where: { id: "${postId}" }) {
        id
      }
    }`, {})

    expect(deletePostData.deletePost.id).toEqual(postId)

    const postData = await queryValidResults(`
    query {
      post(id: "${postId}") {
        id
      }
    }`, {})

    expect(postData.post).toBeNull()

  })
})
