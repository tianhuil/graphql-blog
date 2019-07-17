import { makeServer } from './server/'

const server = makeServer()

server.start(() => {
  console.log(`Connecting to ${process.env["ENDPOINT"]}`)
  console.log(`Server is running on http://localhost:4000`)
})
