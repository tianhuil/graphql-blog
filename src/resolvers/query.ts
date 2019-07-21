import { queryType, arg } from 'nexus'
import { Context } from '../server/context'

export const Query = queryType({
  definition(t) {
    t.list.field('feed', {
      type: 'Post',
      resolve: (parent, args, ctx: Context) => {
        return ctx.prisma.posts({
          where: { published: true }
        })
      }
    })
    
    t.field('post', {
      type: 'Post',
      nullable: true,
      args: {
        where: arg({
          type: 'PostWhereUniqueInput',
          required: true,
        })
      },
      resolve: (parent, { where }, ctx: Context) => {
        return ctx.prisma.post({ id: where.id })
      }
    })

    t.field('me', {
      type: 'User',
      resolve: async (parent, args, ctx: Context) => {
        const user = (await ctx.prisma.user({id : ctx.userId}))
        if (!user) {
          throw Error("Malformed User")
        } else {
          return user
        }
      }
    })
  }
})
