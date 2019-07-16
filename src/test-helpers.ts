import { graphql } from 'graphql'

import { ContextParameters } from "graphql-yoga/dist/types";
import { makeContext, Context } from "./context";
import { Prisma } from "./generated/prisma-client";
import { makeSchema } from './schema'

export function mockContext(params: {
  mockPrisma?: Prisma,  // default is actual prisma connection
  headers?: { [_: string]: string }
}) {
  const { mockPrisma, headers } = params
  const contextParams = {
    request: {
      get: function(name: string): string | undefined {
        return (headers) ? headers[name] : undefined
      }
    }
  } as ContextParameters
  const context = makeContext(contextParams)
  if (mockPrisma) {
    context.prisma = mockPrisma
  }
  return context
}

const schema = makeSchema()

export async function queryValidateResults(
  source: string,
  variables: object,
  context: Context
): Promise<any> {
  const result = await graphql(schema, source, null, context, variables)
  expect(result.errors).toBeUndefined()
  expect(result.data).toBeTruthy()
  return result.data
}

export async function queryExpectError(
  source: string,
  variables: object,
  context: Context
) {
  const result = await graphql(schema, source, null, context, variables)
  expect(result.errors).toBeTruthy()
  expect(result.data).toBeNull()
}
