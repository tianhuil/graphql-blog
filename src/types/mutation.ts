import { idArg, stringArg } from "nexus"
import { prismaObjectType } from "nexus-prisma"
import { Ctx } from "./util"

// @ts-ignore
export const Mutation = prismaObjectType({
  name: "Mutation",
  definition(t) {
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

    t.field("signUp", {
      type: "User",
      args: {
        email: stringArg({ required: true }),
        password: stringArg({ required: true }),
        name: stringArg(),
      },
      resolve: (parent, { email, password, name }, ctx: Ctx) => {
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
