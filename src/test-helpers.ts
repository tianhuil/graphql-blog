import { graphql } from 'graphql'
import { ContextParameters } from "graphql-yoga/dist/types";

import { makeContext, Context } from "./server/context";
import { Prisma, UserCreateInput, PostCreateInput } from "./generated/prisma-client";
import { makeSchema } from './server/schema'
import { Auth } from './lib/auth';

const schema = makeSchema()
const auth = new Auth()

export function mockContext(params: {
  mockPrisma?: Prisma,  // default is actual prisma connection
  headers?: { [_: string]: string },  // headers to be passed in
  userId?: string // add authorization token for user
  token?: string // add authorization token
}) {
  const { mockPrisma, userId, token } = params
  const headers = params.headers || {}

  if (userId) {
    headers['Authorization'] = `Bearer ${auth.signToken(userId)}`
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

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

export abstract class TestDataBase {
  protected userIds: string[] = []
  protected postIds: string[] = []

  constructor(protected prisma: Prisma) { }


  protected async findCreateUser(userData: UserCreateInput): Promise<string> {
    const user = await this.prisma.user({email: userData.email})
    if (user) {
      return user.id
    } else {
      const user = await this.prisma.createUser({
        ...userData
      })
      return user.id
    }
  }

  protected async createConnectPost(postData: PostCreateInput): Promise<string> {
    const post = await this.prisma.createPost(postData)
    return post.id
  }

  abstract async setUp(): Promise<void>

  async tearDown() {
    await Promise.all(this.postIds.map(id =>
      this.prisma.deletePost({id})
    ))
    await Promise.all(this.userIds.map(id =>
      this.prisma.deletePost({id})
    ))
  }
}
