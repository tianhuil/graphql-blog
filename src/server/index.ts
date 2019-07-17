import { GraphQLServer } from 'graphql-yoga'
import { makeSchema } from './schema'
import { makeContext } from './context'

export const makeServer = () => new GraphQLServer({
  schema: makeSchema(),
  context: makeContext,
})
