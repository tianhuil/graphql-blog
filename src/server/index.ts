import { GraphQLServer } from 'graphql-yoga'
import { makeSchema } from './schema'
import { makeContext } from './context'
import { permissions } from '../middlewares/permissions'

export const makeServer = () => new GraphQLServer({
  schema: makeSchema(),
  context: makeContext,
  middlewares: [permissions]
})

