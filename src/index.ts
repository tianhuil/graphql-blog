import { GraphQLServer } from 'graphql-yoga'
import { prisma } from './generated/prisma-client'
import { Auth } from './auth'
import { makeSchema } from './schema'

const server = new GraphQLServer({
  schema: makeSchema(),
  context: request => ({
    ...request,
    prisma,
    auth: new Auth()
  }),
})

server.start(() => {
  console.log(`Connecting to ${process.env["ENDPOINT"]}`)
  console.log(`Server is running on http://localhost:4000`)
})
