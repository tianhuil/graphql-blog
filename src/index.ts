import { GraphQLServer } from 'graphql-yoga'
import { makeSchema } from './schema'
import { makeContext } from './context'

const server = new GraphQLServer({
  schema: makeSchema(),
  context: makeContext,
})

server.start(() => {
  console.log(`Connecting to ${process.env["ENDPOINT"]}`)
  console.log(`Server is running on http://localhost:4000`)
})
