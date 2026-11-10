import { noop } from "@repo/utils/function"
import Bun from "bun"
import { afterEach, beforeEach, mock } from "bun:test"
import { DEFAULT_MIGRATION_LOCK_TABLE, DEFAULT_MIGRATION_TABLE } from "kysely/migration"
import crypto from "node:crypto"

console.log = noop
console.info = noop
console.warn = noop
console.error = noop
console.debug = noop

const TEMPLATE_DATABASE_NAME = "cnam_erp_test_template"
const WORKER_DATABASE_PREFIX = "cnam_erp_test_worker_"

const databaseHost = process.env["DATABASE_HOST"]
const databasePort = process.env["DATABASE_PORT"]
const databaseUser = process.env["DATABASE_USER"]
const databasePassword = process.env["DATABASE_PASSWORD"]
const databaseAdminName = process.env["DATABASE_ADMIN_NAME"]

if (
  databaseHost == null ||
  databasePort == null ||
  databaseUser == null ||
  databasePassword == null ||
  databaseAdminName == null
) {
  throw new Error(
    "Test setup must run via global-setup.ts - missing DATABASE_* env vars from container boot.",
  )
}

const workerDatabaseName = `${WORKER_DATABASE_PREFIX}${process.pid}_${crypto.randomBytes(4).toString("hex")}`

const adminSql = new Bun.SQL({
  adapter: "postgres",
  hostname: databaseHost,
  port: Number(databasePort),
  username: databaseUser,
  password: databasePassword,
  database: databaseAdminName,
})

await adminSql.unsafe(
  `CREATE DATABASE "${workerDatabaseName}" TEMPLATE "${TEMPLATE_DATABASE_NAME}"`,
)
await adminSql.close()

process.env["DATABASE_NAME"] = workerDatabaseName

const workerSql = new Bun.SQL({
  adapter: "postgres",
  hostname: databaseHost,
  port: Number(databasePort),
  username: databaseUser,
  password: databasePassword,
  database: workerDatabaseName,
  max: 1,
})

const tables: Array<{ name: string; isSeeded: boolean }> = await workerSql`
  SELECT tablename AS name, pg_relation_size(quote_ident(tablename)::regclass) > 0 AS "isSeeded"
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename NOT IN ${workerSql([DEFAULT_MIGRATION_TABLE, DEFAULT_MIGRATION_LOCK_TABLE])}
`
const tablesSeeded = tables.filter((table) => {
  return table.isSeeded
})
if (tablesSeeded.length > 0) {
  const tablesSeededNames = tablesSeeded.map((table) => {
    return table.name
  })
  throw new Error(
    `The reset between tests empties every table, but a migration seeds rows into: ${tablesSeededNames.join(", ")}.`,
  )
}
const tablesNames = tables.map((table) => {
  return `"${table.name}"`
})

const emptyWorkerDatabaseStatement = [
  "SET session_replication_role = replica",
  ...tablesNames.map((tableName) => {
    return `DELETE FROM ${tableName}`
  }),
  "SET session_replication_role = DEFAULT",
].join(";")

const emptyWorkerDatabase = async (): Promise<void> => {
  await workerSql.unsafe(emptyWorkerDatabaseStatement)
}

const { QueueManager } = await import("@boringnode/queue")
const { queueInit } = await import("../tools/queue.ts")
const { EmailFakeClient } = await import("../tools/emailClient/EmailFakeClient.ts")
await queueInit()

beforeEach(async () => {
  await emptyWorkerDatabase()
  EmailFakeClient.fake()
})

afterEach(() => {
  mock.restore()
  QueueManager.restore()
  EmailFakeClient.restore()
})
