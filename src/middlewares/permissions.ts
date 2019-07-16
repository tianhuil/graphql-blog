import { rule, shield, or, allow } from 'graphql-shield'
import { Context } from '../context';

const isAuthenticated = rule()(async (parent, args, ctx: Context, info) => {
  return !!ctx.userId
})

const isAuthor = rule()(async (parent, args, ctx: Context, info) => {
  const query = await ctx.prisma.$graphql(`
  query Post($id: ID ){
    post(id: $id) {
      author {
        id
      }
    }
  }
  `)

  if (query && query.data && query.data.post && query.data.post.author) {
    return query.data.post.author.id == ctx.userId
  } else {
    return false
  }
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
