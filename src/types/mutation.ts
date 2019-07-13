import { idArg, stringArg, inputObjectType } from "nexus"
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

// @ts-ignore
export const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
    t.field("signup", {
      type: "User",
      args: {
        data: signupInput
      },
      resolve: (parent, {data: { email, password, name }}, ctx: Ctx) => {
        return ctx.prisma.createUser({
          email,
          password,
          name,
          posts: {
            create: []
          }
        });
      },
    })

    t.field("createDraft", {
      type: "Post",
      args: {
        title: stringArg(),
        text: stringArg(),
        authorId: idArg({ required: true }),
      },
      resolve: (parent, { title, text, authorId }, ctx: Ctx) => {
        return ctx.prisma.createPost({
          title,
          text,
          published: false,
          author: {
            connect: { id: authorId },
          },
        });
      },
    });

    t.field("publishDraft", {
      type: "Post",
      nullable: true,
      args: { id: idArg() },
      resolve: (parent, { id }, ctx: Ctx) => {
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: true},
        });
      },
    });

    t.prismaFields(["deletePost"]);
  },
});
