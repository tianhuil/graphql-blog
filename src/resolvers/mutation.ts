import { idArg, arg, inputObjectType } from "nexus"
import { prismaObjectType } from "nexus-prisma"
import { Ctx } from "./util"

export const signupInput = inputObjectType({
  name: "signupInput",
  definition(t) {
    t.string("email", { required: true })
    t.string("password", { required: true })
    t.string("name")
  },
})

export const createDraftInput = inputObjectType({
  name: "createDraftInput",
  definition(t) {
    t.string("authorId", { required: true })
    t.string("text")
    t.string("title")
  },
})

// @ts-ignore
export const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
    t.field("signup", {
      type: "User",
      args: {
        data: arg({
          type: signupInput
        }),
      },
      resolve: (_, { data }, ctx: Ctx) => {
        return ctx.prisma.createUser({
          ...data!,
          posts: {
            create: []
          }
        });
      },
    })

    t.field("createDraft", {
      type: "Post",
      args: {
        data: arg({
          type: createDraftInput
        }),
      },
      resolve: (_, { data }, ctx: Ctx) => {
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
      resolve: (_, { id }, ctx: Ctx) => {
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: true},
        });
      },
    });

    t.prismaFields(["deletePost"]);
  },
});
