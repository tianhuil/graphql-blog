import { prisma } from './generated/prisma-client'
import { Auth } from './auth'
import { ContextParameters } from 'graphql-yoga/dist/types';

export const makeContext = (params: ContextParameters) => ({
  ...params,
  prisma,
  auth: new Auth(),
})

export type Context = ReturnType<typeof makeContext>
