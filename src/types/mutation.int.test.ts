import { graphql } from 'graphql'

import { schema } from '../schema'
import { prisma } from '../generated/prisma-client'

describe('Test Feed', () => {
  const mutation = `
  mutation {
    signUp(email: "example@example.com", password: "password", name: "Bob") {
      id
      createdAt
      name
    }
  }`

  const context = { prisma }

  const variables = {}

  test('Test feed', async () => {
    const result = await graphql(schema, mutation, null, context, variables)
    expect(result.errors).toBeUndefined()
    expect(result.data).toBeTruthy()
    expect( result.data!.signUp.name ).toBe("Bob")
  })
})
