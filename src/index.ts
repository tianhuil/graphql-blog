import { GraphQLServer } from 'graphql-yoga'
import { makeSchema } from './schema'
import { makeContext } from './context'
import { permissions } from './middlewares/permissions'

const makeServer = () => new GraphQLServer({
  schema: makeSchema(),
  context: makeContext,
  middlewares: [permissions]
})

const server = makeServer()

server.start(() => {
  console.log(`Connecting to ${process.env["ENDPOINT"]}`)
  console.log(`Server is running on http://localhost:4000`)
})
