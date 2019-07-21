import { graphql } from 'graphql'

import { Context } from "../server/context";
import { makeSchema } from '../server/schema';

export { mockContext } from './mocks'
export { TestDataBase } from './test-data'

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


