# graphql-blog
A typescript blog for graphql

# Notes:
Postgres non-durable for dev and testing (see [here](https://www.postgresql.org/docs/10/non-durability.html) and [here](https://stackoverflow.com/questions/9407442/optimise-postgresql-for-fast-testing)).  We don't want to do these in production (currently just edits to the `command` in `docker-compose.yml`)
