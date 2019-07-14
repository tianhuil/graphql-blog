import ApolloClient, { gql } from 'apollo-boost'
import 'isomorphic-fetch'

async function main() {
  const client = new ApolloClient({
    uri: process.env["ENDPOINT"],
  })

  const result = await client.query({
    query: gql`query {
      feed {
        id
        title
        text
        author {
          id
          name
          createdAt
        }
      }
    }`
  })

  console.log(JSON.stringify(result.data, null, 2))
}

main().catch(e => console.error(e))
