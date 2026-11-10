import { prettyMilliseconds } from "@repo/utils/date"
import Bun from "bun"
import { Kysely } from "kysely"
import { KyselyTypegenPostgresDialect } from "kysely-typegen/postgres"
import { FileMigrationProvider, Migrator } from "kysely/migration"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { bigIntToNumberPlugin, BunSQLDialect } from "./BunSQLDialect.ts"
import {
  DATABASE_DEBUG,
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_PASSWORD,
  DATABASE_POOL_CONNECTIONS_MAX,
  DATABASE_PORT,
  DATABASE_USER,
} from "./configuration.ts"
import type { Database } from "./types.ts"

const dialect = new BunSQLDialect({
  postgres: new Bun.SQL({
    adapter: "postgres",
    database: DATABASE_NAME,
    hostname: DATABASE_HOST,
    username: DATABASE_USER,
    password: DATABASE_PASSWORD,
    port: DATABASE_PORT,
    max: DATABASE_POOL_CONNECTIONS_MAX,
    bigint: true,
  }),
})

export const database = new Kysely<Database>({
  dialect,
  plugins: [bigIntToNumberPlugin],
  log: (event) => {
    if (event.level === "error") {
      console.error(`kysely:error:`, event.error)
      console.error(`kysely:error:query:`, event.query.sql)
      console.error(`kysely:error:parameters:`, event.query.parameters)
      console.error(`kysely:error:duration:`, prettyMilliseconds(event.queryDurationMillis))
      console.error()
      return
    }

    if (DATABASE_DEBUG) {
      console.log(`kysely:query:`, event.query.sql)
      console.log("kysely:query:parameters:", event.query.parameters)
      console.log(`kysely:query:duration:`, prettyMilliseconds(event.queryDurationMillis))
      console.log()
    }
  },
})

export const DATABASE_MIGRATIONS_PATH = fileURLToPath(new URL("./migrations", import.meta.url))

export const databaseMigrator = new Migrator({
  db: database,
  provider: new FileMigrationProvider({
    fs: fs.promises,
    path: {
      join: (...segments) => {
        return pathToFileURL(path.join(...segments)).href
      },
    },
    migrationFolder: DATABASE_MIGRATIONS_PATH,
  }),
})

export const databaseTypegen = new KyselyTypegenPostgresDialect({
  database,
})
databaseTypegen.scalars["date"] = "CalendarDay"
