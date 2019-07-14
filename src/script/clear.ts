import { prisma } from '../generated/prisma-client'

async function main() {
    // Must be run in serial for relationship invariant to hold
    prisma.deleteManyPosts()
    prisma.deleteManyUsers()
}

main().catch(e => console.error(e))
