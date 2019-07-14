import { queryType, idArg } from 'nexus'
import { Context } from '../context'

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
      args: { id: idArg() },
      resolve: (parent, { id }, ctx: Context) => {
        return ctx.prisma.post({ id })
      }
    })
  }
})
