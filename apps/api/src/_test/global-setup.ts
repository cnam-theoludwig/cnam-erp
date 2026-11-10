import { PostgreSqlContainer } from "@testcontainers/postgresql"
import { RedisContainer } from "@testcontainers/redis"
import Bun from "bun"
import { spawn } from "node:child_process"
import os from "node:os"
import { fileURLToPath } from "node:url"

const TIMEZONE = "Europe/Paris"
process.env["TZ"] = TIMEZONE

const PASSWORD_HASH_MEMORY_KIB_MIN = 32
const TEMPLATE_DATABASE_NAME = "cnam_erp_test_template"
const WORKER_DATABASE_PREFIX = "cnam_erp_test_worker_"
const SETUP_PATH = fileURLToPath(new URL("./setup.ts", import.meta.url))
const TEST_WORKERS_COUNT_MAX = Number(process.env["TEST_CONCURRENCY"] ?? os.availableParallelism())
const DATABASE_POOL_CONNECTIONS_PER_WORKER_MAX = 10
const DATABASE_RESET_CONNECTIONS_PER_WORKER_MAX = 1
const DATABASE_CONNECTIONS_MAX =
  (TEST_WORKERS_COUNT_MAX + 1) *
  (DATABASE_POOL_CONNECTIONS_PER_WORKER_MAX + DATABASE_RESET_CONNECTIONS_PER_WORKER_MAX)

const POSTGRES_COMMAND = [
  "postgres",
  "-c",
  `max_connections=${DATABASE_CONNECTIONS_MAX}`,
  "-c",
  "fsync=off",
  "-c",
  "synchronous_commit=off",
  "-c",
  "full_page_writes=off",
]

const startContainers = async (): Promise<{
  stop: () => Promise<void>
}> => {
  const [postgresContainer, redisContainer] = await Promise.all([
    new PostgreSqlContainer(
      "docker.io/postgres:18.6@sha256:06cad38a5d9f5d24b4d83d86def30795d5e4b757fedbf5281172b576dedcd941",
    )
      .withEnvironment({ TZ: TIMEZONE })
      .withCommand(POSTGRES_COMMAND)
      .start(),
    new RedisContainer(
      "docker.io/redis:8.10.2@sha256:d5ac52db24d4e70566fe9944f22cf5bdc2bc739b05c0f426335161ea6c23f3b3",
    ).start(),
  ])

  process.env["DATABASE_HOST"] = postgresContainer.getHost()
  process.env["DATABASE_PORT"] = postgresContainer.getPort().toString()
  process.env["DATABASE_USER"] = postgresContainer.getUsername()
  process.env["DATABASE_PASSWORD"] = postgresContainer.getPassword()
  process.env["DATABASE_NAME"] = postgresContainer.getDatabase()
  process.env["DATABASE_ADMIN_NAME"] = postgresContainer.getDatabase()
  process.env["DATABASE_POOL_CONNECTIONS_MAX"] = DATABASE_POOL_CONNECTIONS_PER_WORKER_MAX.toString()

  process.env["REDIS_HOST"] = redisContainer.getHost()
  process.env["REDIS_PORT"] = redisContainer.getPort().toString()
  process.env["REDIS_PASSWORD"] = redisContainer.getPassword()

  process.env["AUTH_SECRET"] = "test-secret-for-jwt-signing"
  process.env["PASSWORD_HASH_MEMORY_KIB"] = PASSWORD_HASH_MEMORY_KIB_MIN.toString()

  return {
    stop: async () => {
      await Promise.all([postgresContainer.stop(), redisContainer.stop()])
    },
  }
}

const buildTemplateDatabase = async (): Promise<void> => {
  process.env["DATABASE_NAME"] = TEMPLATE_DATABASE_NAME

  const adminSql = new Bun.SQL({
    adapter: "postgres",
    hostname: process.env["DATABASE_HOST"],
    port: Number(process.env["DATABASE_PORT"]),
    username: process.env["DATABASE_USER"],
    password: process.env["DATABASE_PASSWORD"],
    database: process.env["DATABASE_ADMIN_NAME"],
  })
  await adminSql.unsafe(`DROP DATABASE IF EXISTS "${TEMPLATE_DATABASE_NAME}" WITH (FORCE)`)
  await adminSql.unsafe(`CREATE DATABASE "${TEMPLATE_DATABASE_NAME}"`)
  await adminSql.close()

  const { databaseMigrator, database } = await import("../tools/database/database.ts")
  const { error } = await databaseMigrator.migrateToLatest()
  if (error != null) {
    console.error("Migration failed:", error)
    throw error
  }
  await database.destroy()
}

const dropOrphanWorkerDatabases = async (): Promise<void> => {
  const adminSql = new Bun.SQL({
    adapter: "postgres",
    hostname: process.env["DATABASE_HOST"],
    port: Number(process.env["DATABASE_PORT"]),
    username: process.env["DATABASE_USER"],
    password: process.env["DATABASE_PASSWORD"],
    database: process.env["DATABASE_ADMIN_NAME"],
  })
  try {
    const orphans: Array<{ datname: string }> = await adminSql`
      SELECT datname FROM pg_database
      WHERE datname LIKE ${WORKER_DATABASE_PREFIX + "%"}
    `
    await Promise.all(
      orphans.map(async ({ datname }) => {
        await adminSql.unsafe(`DROP DATABASE IF EXISTS "${datname}" WITH (FORCE)`)
      }),
    )
  } finally {
    await adminSql.close()
  }
}

const main = async (): Promise<void> => {
  const containers = await startContainers()
  try {
    await buildTemplateDatabase()
    await dropOrphanWorkerDatabases()

    const child = spawn(
      process.execPath,
      [
        "test",
        `--parallel=${TEST_WORKERS_COUNT_MAX}`,
        "--no-isolate",
        `--preload=${SETUP_PATH}`,
        ...process.argv.slice(2),
      ],
      { stdio: "inherit" },
    )

    process.exitCode = await new Promise<number>((resolve) => {
      child.on("exit", (code) => {
        resolve(code ?? 1)
      })
    })

    await dropOrphanWorkerDatabases()
  } finally {
    await containers.stop()
  }
}

await main()
