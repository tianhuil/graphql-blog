import { Prisma } from './generated/prisma-client'
import { Auth } from './auth'

export interface Ctx {
  prisma: Prisma
  auth: Auth
}
