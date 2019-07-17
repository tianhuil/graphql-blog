import { graphql } from 'graphql'

import { makeSchema } from '../server/schema'
import { Prisma, prisma } from '../generated/prisma-client';
import { mockContext } from '../test-helpers';

describe('Test Queries', () => {
  const schema = makeSchema()

  test('Test feed', async () => {
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
  
    const context = mockContext({mockPrisma})

    const { data } = await graphql(schema, query, null, context, {})
    expect( data ).toEqual({ feed: posts })
  })
})
