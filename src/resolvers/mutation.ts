import * as bcrypt from 'bcrypt'
import { idArg, arg } from "nexus"
import { prismaObjectType } from "nexus-prisma"
import { Context } from "../context"
import { SignupInput, CreateDraftInput, AuthPayload, LoginInput } from './types'
import { User } from '../generated/prisma-client';

const authPayload = (user: User, ctx: Context) => ({
  token: ctx.auth.signToken(user.id),
  user,
})

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
        const user = await ctx.prisma.createUser({
          ...data!,
          password: await bcrypt.hash(data!.password, 10),
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
        const { email, password } = data!
        const user = await ctx.prisma.user({email})
        if (!user) {
          throw Error("Invalid email, password combination")
        }
        if (!await bcrypt.compare(password, user.password)) {
          throw Error("Invalid email, password combination")
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
        return ctx.prisma.createPost({
          title: data!.title,
          text: data!.text,
          published: false,
          author: {
            connect: { id: data!.authorId },
          },
        });
      },
    });

    t.field("publishDraft", {
      type: "Post",
      nullable: true,
      args: { id: idArg() },
      resolve: (_, { id }, ctx: Context) => {
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: true},
        });
      },
    });

    t.prismaFields(["deletePost"]);
  },
});
