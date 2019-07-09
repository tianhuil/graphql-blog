import { prisma } from './generated/prisma-client'

async function main() {
  console.log("Clear all data ...")
  await prisma.deleteManyPosts()  // must clear first so user can be null
  await prisma.deleteManyUsers()

  console.log("Create new users ...")
  await Promise.all([
    prisma.createUser({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'password',
      posts: {
        create: [{
          title: "A",
          text: "A",
        }, {
          title: "B",
          text: "B",
        }]
      }
    }),
    prisma.createUser({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'password',
      posts: {
        create: [{
          title: "C",
          text: "C",
        }]
      }
    }),
  ])

  console.log("Printing user data ...")
  console.log(await prisma.users())
  console.log("Printing post data ...")
  console.log(await prisma.posts())
}

main().catch(e => console.error(e))
