import { rule, shield, or, allow } from 'graphql-shield'
import { Context } from '../server/context';

const isAuthenticated = rule()(async (parent, args, ctx: Context, info) => {
  return !!ctx.userId
})

const isAuthor = rule()(async (parent, args, ctx: Context, info) => {
  const posts = await ctx.prisma.posts({
    where: {
      author: {
        id: ctx.userId
      },
      id: args.id
    }
  })
  return !!posts
})

const isPublished = rule()(async (parent, args, ctx: Context, info) => {
  const post = await ctx.prisma.post(args)
  return (post) ? post.published : false
})

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
