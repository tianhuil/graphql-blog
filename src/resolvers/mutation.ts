import { arg } from "nexus"
import { prismaObjectType } from "nexus-prisma"
import { Context } from "../server/context"
import { SignupInput, CreateDraftInput, AuthPayload, LoginInput } from './types'
import { User } from '../generated/prisma-client';

const authPayload = (user: User, ctx: Context) => ({
  token: ctx.auth.signToken(user.id),
  user,
})

class ArgDataError extends Error {
  constructor(message = "Data field must be supplied") {
    super(message)
    Object.setPrototypeOf(this, ArgDataError.prototype)
  }
}

class AuthError extends Error {
  constructor(message = "Invalid email, password combination") {
    super(message)
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

// @ts-ignore
export const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
    t.field("signup", {
      type: AuthPayload,
      args: {
        data: arg({
          type: SignupInput
        }),
      },
      resolve: async (_, { data }, ctx: Context) => {
        if (!data) { throw new ArgDataError() }
        const user = await ctx.prisma.createUser({
          ...data,
          password: await ctx.auth.hash(data.password),
          posts: {
            create: []
          }
        });

        return authPayload(user, ctx)
      },
    })

    t.field("login", {
      type: AuthPayload,
      args: {
        data: arg({
          type: LoginInput
        })
      },
      resolve: async (_, { data }, ctx: Context) => {
        if (!data) { throw new ArgDataError() }
        const { email, password } = data
        const user = await ctx.prisma.user({email})
        if (!user) {
          throw new AuthError()
        }
        if (!await ctx.auth.compare(password, user.password)) {
          throw new AuthError()
        }
        return authPayload(user, ctx)
      }
    })

    t.field("createDraft", {
      type: "Post",
      args: {
        data: arg({
          type: CreateDraftInput
        }),
      },
      resolve: (_, { data }, ctx: Context) => {
        if (!data) { throw new ArgDataError() }
        return ctx.prisma.createPost({
          title: data.title,
          text: data.text,
          published: false,
          author: {
            connect: { id: ctx.userId },
          },
        });
      },
    });

    t.field("publishDraft", {
      type: "Post",
      nullable: true,
      args: {
        where: arg({
          type: 'PostWhereUniqueInput',
          required: true
        })
      },
      resolve: (_, { where }, ctx: Context) => {
        return ctx.prisma.updatePost({
          where: { id: where.id },
          data: { published: true},
        });
      },
    });

    t.prismaFields(["deletePost"]);
  },
});
