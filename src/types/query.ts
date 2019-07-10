import { queryType, idArg } from 'nexus'
import { Ctx } from './util'

export const Query = queryType({
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
