import { prisma } from './generated/prisma-client'
import { Auth } from './auth'
import { ContextParameters } from 'graphql-yoga/dist/types';

export const context = (request: ContextParameters) => ({
  ...request,
  prisma,
  auth: new Auth()
})
