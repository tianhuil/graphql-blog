import { GraphQLServer } from 'graphql-yoga'
import { prisma } from './generated/prisma-client'

import { makeSchema } from './schema'

const server = new GraphQLServer({
  schema: makeSchema(),
  context: { prisma },
})

server.start(() => {
  console.log(`Connecting to ${process.env["ENDPOINT"]}`)
  console.log(`Server is running on http://localhost:4000`)
})
