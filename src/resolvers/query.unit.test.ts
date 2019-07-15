import { graphql } from 'graphql'

import { makeSchema } from '../schema'
import { Prisma } from '../generated/prisma-client';
import { mockContext } from '../test-helpers';

describe('Test Feed', () => {
  const schema = makeSchema()

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

  const mockPrisma = ({
    posts: jest.fn().mockImplementation(() => posts)
  } as unknown as Prisma)

  const context = mockContext(mockPrisma)

  const variables = {}
  test('Test feed', async () => {
    const { data } = await graphql(schema, query, null, context, variables)
    expect( data ).toEqual({ feed: posts })
  })
})
