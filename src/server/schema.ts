import * as path from 'path'
import { makePrismaSchema } from 'nexus-prisma'
import { prisma } from '../generated/prisma-client'
import datamodelInfo from '../generated/nexus-prisma'
import {Query, Mutation, User, Post, AuthPayload} from '../resolvers'

export const makeSchema = () => makePrismaSchema({
  types: [Query, Mutation, User, Post, AuthPayload],
  prisma: {
    datamodelInfo,
    client: prisma,
  },
  outputs: {
    schema: path.join(__dirname, '../generated/nexus-client/schema.graphql'),
    typegen: path.join(__dirname, '../generated/nexus-client/nexus.ts'),
  },
})
