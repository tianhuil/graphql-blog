import * as path from 'path'
import { makePrismaSchema } from 'nexus-prisma'
import { prisma } from './generated/prisma-client'
import datamodelInfo from './generated/nexus-prisma'
import {Query, Mutation, User, Post} from './types'

export const schema = makePrismaSchema({
  types: [Query, Mutation, User, Post],
  prisma: {
    datamodelInfo,
    client: prisma,
  },
  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },
})
