import { prisma } from '../generated/prisma-client'
import { Auth } from '../lib/auth'
import { ContextParameters } from 'graphql-yoga/dist/types';

export const makeContext = (params: ContextParameters) => {
  const auth = new Auth()

  function getUserId(): string | null {
    const authorization = params.request.get('Authorization')
    if (authorization) {
      const token = authorization.replace('Bearer ', '')
      const verifiedToken = auth.verifyToken(token)
      return verifiedToken && verifiedToken.userId
    }
    return null
  }

  return {
    prisma,
    auth,
    userId: getUserId()
  }
}

export type Context = ReturnType<typeof makeContext>
