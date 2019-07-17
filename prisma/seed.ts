import { prisma } from '../src/generated/prisma-client'
import { Auth } from '../src/lib/auth';

async function main() {
  console.log("Clear all data ...")
  // must clear first so user can be null
  await prisma.deleteManyPosts()  
  await prisma.deleteManyUsers()

  const auth = new Auth()

  console.log("Create new users ...")
  await Promise.all([
    prisma.createUser({
      name: 'Alice',
      email: 'alice@example.com',
      password: await auth.hash('password'),
      posts: {
        create: [{
          title: "A",
          text: "A",
        }, {
          title: "B",
          text: "B",
          published: true,
        }]
      }
    }),
    prisma.createUser({
      name: 'Bob',
      email: 'bob@example.com',
      password: await auth.hash('password'),
      posts: {
        create: [{
          title: "C",
          text: "C",
          published: true,
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
