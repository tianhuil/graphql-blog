import gulp from 'gulp'
import run from 'gulp-run-command'
import { argv } from 'yargs'

const TEST_ENV = 'env/test.env',
      DEV_ENV  = 'env/dev.env'

const dotenv = () => {
  if (argv.dev) {
    return DEV_ENV
  } else if (argv.test) {
    return TEST_ENV
  } else {
    throw 'Expected either `--dev` or `--test` to be set'
  }
}

const testType = () => {
  if (argv.unit) {
    return 'unit.test'
  } else if (argv.int) {
    return 'int.test'
  } else {
    return 'test'
  }
}

gulp.task('docker-up', run("docker-compose up"))

gulp.task('docker-down', run("docker-compose down"))

gulp.task('clear', () => run(
  `ts-node -r dotenv/config --transpile-only scripts/clear.ts`,
  { env: { DOTENV_CONFIG_PATH: dotenv()}}
))

gulp.task('deploy', () => run(
  `prisma deploy -e ${dotenv()}`
))

gulp.task('generate', () => run(
  `prisma generate -e ${dotenv()}`
))

gulp.task('seed', () => run(
  `ts-node -r dotenv/config --transpile-only prisma/seed.ts`,
  { env: { DOTENV_CONFIG_PATH: dotenv()} }
))

gulp.task('nexus-generate', () => run(
  "nexus-prisma-generate --client src/generated/prisma-client --output src/generated/nexus-prisma"
))

gulp.task('query', () => run(
  "ts-node --transpile-only scripts/query.ts"
))

gulp.task('test', () => run(
  `jest ${testType()} -o --watch`,
  { env: { DOTENV_CONFIG_PATH: TEST_ENV} }
))

gulp.task('start', () => run(
  `ts-node-dev -r dotenv/config --no-notify --respawn ./src`,
  { env: { DOTENV_CONFIG_PATH: DEV_ENV} }
))
