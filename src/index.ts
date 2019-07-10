import * as path from 'path'
import { GraphQLServer } from 'graphql-yoga'
import { makePrismaSchema, prismaObjectType } from 'nexus-prisma'
import { queryType, idArg, stringArg } from 'nexus'
import { prisma, Post as PostType, Prisma } from './generated/prisma-client'
import datamodelInfo from './generated/nexus-prisma'

export interface Ctx {
  prisma: Prisma
}

const Query = queryType({
  definition(t) {
    t.list.field('feed', {
      type: 'Post',
      resolve: (parent, args, ctx: Ctx) => {
        return ctx.prisma.posts({
          where: { published: true }
        })
      }
    })
    
    t.field('post', {
      type: 'Post',
      nullable: true,
      args: { id: idArg() },
      resolve: (parent, { id }, ctx: Ctx) => {
        return ctx.prisma.post({ id })
      }
    })
  }
})

// @ts-ignore
const Mutation = prismaObjectType({
  name: 'Mutation',
  definition(t) {
    t.field('createDraft', {
      type: 'Post',
      args: {
        title: stringArg(),
        text: stringArg(),
        authorId: idArg(),
      },
      resolve: (parent, { title, text, authorId }, ctx: Ctx) => {
        return ctx.prisma.createPost({
          title,
          text,
          published: false,
          author: {
            connect: { id: authorId }
          }
        })
      }
    })

    t.field('publishDraft', {
      type: 'Post',
      nullable: true,
      args: { id: idArg() },
      resolve: (parent, { id }, ctx: Ctx) => {
        return ctx.prisma.updatePost({
          where: { id },
          data: { published: true},
        })
      }
    })

    t.prismaFields(['deletePost'])
  }
})

const User = prismaObjectType({
  name: 'User',
  definition: t => t.prismaFields(['id', 'createdAt', 'name'])
})

const Post = prismaObjectType({
  name: 'Post',
  definition(t) {
    t.prismaFields(['*'])
  }
})

const schema = makePrismaSchema({
  types: [Query, Mutation, User, Post],
  prisma: {
    datamodelInfo,
    client: prisma,
  },
  outputs: {
    schema: path.join(__dirname, './generated/schema.graphql'),
    typegen: path.join(__dirname, './generated/nexus.ts'),
  },
})

const server = new GraphQLServer({
  schema,
  context: { prisma },
})

server.start(() => {
  console.log(`Connecting to ${process.env["SERVER"]}/${process.env["SERVICE"]}/${process.env["STAGE"]}`)
  console.log(`Server is running on http://localhost:4000`)
})
