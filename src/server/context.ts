import { prisma } from '../generated/prisma-client'
import { Auth } from './auth'
import { ContextParameters } from 'graphql-yoga/dist/types';

export const makeContext = (params: ContextParameters) => {
  const auth = new Auth()

  return {
    prisma,
    auth,
    userId: (() => {
      const authorization = params.request.get('Authorization')
      if (authorization) {
        const token = authorization.replace('Bearer ', '')
        const verifiedToken = auth.verifyToken(token)
        return verifiedToken && verifiedToken.userId
      }
      return null
    })()
  }
}

export type Context = ReturnType<typeof makeContext>
