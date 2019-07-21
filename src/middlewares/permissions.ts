import { rule, shield, or, allow } from 'graphql-shield'
import { Rule } from 'graphql-shield/dist/rules';
import { Context } from '../server/context';
import { PostWhereUniqueInput } from '../generated/nexus-prisma/nexus-prisma';

export const isAuthenticated: Rule = rule()(
  async (parent, args: any, ctx: Context, info): Promise<boolean> => {
    return (ctx.userId === null) ? false : await ctx.prisma.$exists.user({id: ctx.userId})
  }
)

type WherePostInput = { where: PostWhereUniqueInput }

export const isAuthor: Rule = rule()(
  async (parent, args: WherePostInput, ctx: Context, info): Promise<boolean> => {
    if (!ctx.userId || !args.where || !args.where.id) {
      return false
    }

    return ctx.prisma.$exists.post({
      author: {
        id: ctx.userId
      },
      id: args.where.id
    })
  }
)

export const isPublished: Rule = rule()(
  async (parent, args: WherePostInput, ctx: Context, info) => {
    const post = await ctx.prisma.post({id: args.where.id})
    return (post) ? post.published : false
  }
)

export const permissions = shield<any, Context, any>({
  Query: {
    feed: allow,
    post: or(isPublished, isAuthor),
    me: isAuthenticated,
  },
  Mutation: {
    signup: allow,
    login: allow,
    createDraft: isAuthenticated,
    publishDraft: isAuthor,
    deletePost: isAuthor,
  },
  AuthPayload: allow,
  User: allow,
  Post: allow,
})
