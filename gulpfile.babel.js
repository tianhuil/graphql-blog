import gulp from 'gulp'
import run from 'gulp-run-command'
import { argv } from 'yargs'

const TEST_ENV = 'env/test.env',
      DEV_ENV = 'env/dev.env'

const dotenv = () => {
  if (argv.dev) {
    return TEST_ENV
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

const exec = (cmd, options={}) => run(cmd, options)()

gulp.task('docker-up', run("docker-compose up"))

gulp.task('docker-down', run("docker-compose down"))

gulp.task('clear', () => exec(
  `ts-node -r dotenv/config --transpile-only scripts/clear.ts`,
  { env: { DOTENV_CONFIG_PATH: dotenv()}}
))

gulp.task('deploy', () => exec(
  `prisma deploy -e ${dotenv()}`
))

gulp.task('generate', () => exec(
  `prisma generate -e ${dotenv()}`
))

gulp.task('seed', () => exec(
  `ts-node -r dotenv/config --transpile-only prisma/seed.ts`,
  { env: { DOTENV_CONFIG_PATH: dotenv()} }
))

gulp.task('nexus-generate', () => exec(
  "nexus-prisma-generate --client src/generated/prisma-client --output src/generated/nexus-prisma"
))

gulp.task('nexus-query', () => exec(
  "ts-node -r dotenv/config --transpile-only scripts/nexus-query.ts",
  { env: { DOTENV_CONFIG_PATH: dotenv()} }
))

gulp.task('test', () => exec(
  `jest ${testType()} -o --watch`,
  { env: { DOTENV_CONFIG_PATH: TEST_ENV} }
))

gulp.task('start', () => exec(
  `ts-node-dev -r dotenv/config --no-notify --respawn ./src`,
  { env: { DOTENV_CONFIG_PATH: DEV_ENV} }
))
