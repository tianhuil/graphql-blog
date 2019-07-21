import { ContextParameters } from "graphql-yoga/dist/types";
import { makeContext } from "../server/context";
import { Prisma } from "../generated/prisma-client";
import { Auth } from '../lib/auth';

export const auth = new Auth()

export function mockContext(params: {
  mockPrisma?: Prisma; // default is actual prisma connection
  headers?: {
    [_: string]: string;
  }; // headers to be passed in
  userId?: string; // add authorization token for user
  token?: string; // add authorization token
})
{
  const { mockPrisma, userId, token } = params;
  const headers = params.headers || {};
  
  if (userId) {
    headers['Authorization'] = `Bearer ${auth.signToken(userId)}`;
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const contextParams = {
    request: {
      get: function (name: string): string | undefined
      {
        return (headers) ? headers[name] : undefined;
      }
    }
  } as ContextParameters;

  const context = makeContext(contextParams);

  if (mockPrisma) {
    context.prisma = mockPrisma;
  }

  return context;
}
