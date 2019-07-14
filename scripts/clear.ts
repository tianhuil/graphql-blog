import { prisma } from '../src/generated/prisma-client'

async function main() {
  // Must be run in serial for relationship invariant to hold
  await prisma.deleteManyPosts()
  await prisma.deleteManyUsers()
}

main().catch(e => console.error(e))
