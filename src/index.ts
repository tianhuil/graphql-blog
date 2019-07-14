import { GraphQLServer } from 'graphql-yoga'
import { makeSchema } from './schema'
import { context } from './context'

const server = new GraphQLServer({
  schema: makeSchema(),
  context,
})

server.start(() => {
  console.log(`Connecting to ${process.env["ENDPOINT"]}`)
  console.log(`Server is running on http://localhost:4000`)
})
