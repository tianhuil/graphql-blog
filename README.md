# graphql-blog
A typescript blog for graphql

## Database configuration
Postgres non-durable for dev and testing (see [here](https://www.postgresql.org/docs/10/non-durability.html) and [here](https://stackoverflow.com/questions/9407442/optimise-postgresql-for-fast-testing)).  We don't want to do these in production (currently just edits to the `command` in `docker-compose.yml`)

## Test database seeding
Testing with a database introduces state and be a challenge for concurrency.  For integration tests (`*.test.int.ts`) we introduce a `blog$test` environment (see `test.env`) to separate it from `dev`.  Tests make the assumption that the database could contain other data (including objects with already used unique keys).  Therefore, we

1. Ensure that unique fields (e.g. `User.email` are named after the test file in some way so that they do not collide).  We further test for the existence of `User` with an email field before creating it, in case the object was not deleted in the last iteration of the test.
2. Keep track of all keys of created objects for subsequent testing.
3. Delete the created objects via the keys from #2.

A helper class (`TestDataBase`) that helps to manage the above process.
