import { graphql } from 'graphql'

import { schema } from '../schema'

describe('Test Feed', () => {
  const query = `
  query {
    feed {
      title
      text
    }
  }
  `
  const posts = [
    { text: "a", title: "a" },
    { text: "b", title: "b" }
  ]

  const mockPrisma = {
    posts: () => posts
  }

  const context = { prisma: mockPrisma }

  const variables = {}
  test('Test feed', async () => {
    const { data } = await graphql(schema, query, null, context, variables)
    expect( data ).toEqual({ feed: posts })
  })
})
