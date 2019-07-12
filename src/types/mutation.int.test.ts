import { graphql } from 'graphql'

import { schema } from '../schema'
import { prisma } from '../generated/prisma-client'

describe('Test Mutations', () => {
  const context = { prisma }

  test('Test signUp and creat', async () => {
    const signUpResult = await graphql(schema, `
    mutation {
      signUp(email: "example@example.com", password: "password", name: "Bob") {
        id
        createdAt
        name
      }
    }`, null, context, {})

    expect(signUpResult.errors).toBeUndefined()
    expect(signUpResult.data).toBeTruthy()
    expect(signUpResult.data!.signUp.name).toEqual("Bob")
    const authorId = signUpResult.data!.signUp.id
    expect(authorId).toBeTruthy()

    const createDraftResult = await graphql(schema, `
    mutation {
      createDraft(title: "Title", authorId: "${authorId}") {
        id
        createdAt
        title
      }
    }`, null, context, {})

    expect(createDraftResult.errors).toBeUndefined()
    expect(createDraftResult.data).toBeTruthy()
    expect(createDraftResult.data!.createDraft.title).toEqual("Title")
    const postId = createDraftResult.data!.createDraft.id
    expect( postId ).toBeTruthy()
  })
})
