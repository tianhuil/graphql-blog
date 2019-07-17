import * as path from 'path'
import { makePrismaSchema } from 'nexus-prisma'
import {applyMiddleware } from 'graphql-middleware'
import { prisma } from '../generated/prisma-client'
import datamodelInfo from '../generated/nexus-prisma'
import { types } from '../resolvers'

import { middlewares } from '../middlewares/';

export const makeSchema = () => applyMiddleware(makePrismaSchema({
  types,
  prisma: {
    datamodelInfo,
    client: prisma,
  },
  outputs: {
    schema: path.join(__dirname, '../generated/nexus-client/schema.graphql'),
    typegen: path.join(__dirname, '../generated/nexus-client/nexus.ts'),
  },
}), ...middlewares)
