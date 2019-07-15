import { ContextParameters } from "graphql-yoga/dist/types";
import { makeContext } from "./context";
import { Prisma } from "./generated/prisma-client";

export const mockContext = (prisma: Prisma | null = null) => {
  const context = makeContext({} as ContextParameters)
  if (prisma) {
    context.prisma = prisma
  }
  return context
}
