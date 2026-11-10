import { getCalendarDayFromDate } from "@repo/utils/date"
import type { ReservedSQL, SQL } from "bun"
import type {
  DatabaseConnection,
  Dialect,
  Driver,
  Kysely,
  KyselyPlugin,
  QueryResult,
  TransactionSettings,
} from "kysely"
import { CompiledQuery, PostgresAdapter, PostgresIntrospector, PostgresQueryCompiler } from "kysely"

/**
 * @see https://github.com/postgres/postgres/blob/master/src/include/catalog/pg_type.dat
 */
const POSTGRES_DATE_TYPE_OID = 1082

type BunSQLRows = Array<Record<string, unknown>> & SQL.ResultMetadata

/**
 * `Bun.SQL` returns a `DATE` as a `Date` at UTC midnight, like a `timestamptz`, so only the column type tells them apart.
 */
const convertDateColumnsToCalendarDays = (rows: BunSQLRows): void => {
  const dateColumnNames = (rows.columns ?? [])
    .filter((column) => {
      return column.type === POSTGRES_DATE_TYPE_OID
    })
    .map((column) => {
      return column.name
    })
  for (const row of rows) {
    for (const columnName of dateColumnNames) {
      const value = row[columnName]
      if (value instanceof Date) {
        row[columnName] = getCalendarDayFromDate({ date: value, timezone: "UTC" })
      }
    }
  }
}

class BunSQLConnection implements DatabaseConnection {
  readonly #reservedConnection: ReservedSQL

  public constructor(reservedConnection: ReservedSQL) {
    this.#reservedConnection = reservedConnection
  }

  public async executeQuery<Row>(compiledQuery: CompiledQuery): Promise<QueryResult<Row>> {
    const rows: BunSQLRows = await this.#reservedConnection.unsafe(compiledQuery.sql, [
      ...compiledQuery.parameters,
    ])
    convertDateColumnsToCalendarDays(rows)
    return { rows: [...rows] as Row[], numAffectedRows: BigInt(rows.affectedRows) }
  }

  public streamQuery(): never {
    throw new Error('"BunSQLDialect" does not stream queries.')
  }

  public async release(): Promise<void> {
    await this.#reservedConnection.release()
  }
}

class BunSQLDriver implements Driver {
  readonly #postgres: SQL

  public constructor(postgres: SQL) {
    this.#postgres = postgres
  }

  public async init(): Promise<void> {}

  public async acquireConnection(): Promise<BunSQLConnection> {
    return new BunSQLConnection(await this.#postgres.reserve())
  }

  public async beginTransaction(
    connection: BunSQLConnection,
    settings: TransactionSettings,
  ): Promise<void> {
    let statement = "start transaction"
    if (settings.isolationLevel !== undefined) {
      statement += ` isolation level ${settings.isolationLevel}`
    }
    if (settings.accessMode !== undefined) {
      statement += ` ${settings.accessMode}`
    }
    await connection.executeQuery(CompiledQuery.raw(statement))
  }

  public async commitTransaction(connection: BunSQLConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("commit"))
  }

  public async rollbackTransaction(connection: BunSQLConnection): Promise<void> {
    await connection.executeQuery(CompiledQuery.raw("rollback"))
  }

  public async releaseConnection(connection: BunSQLConnection): Promise<void> {
    await connection.release()
  }

  public async destroy(): Promise<void> {
    await this.#postgres.end()
  }
}

class BunSQLQueryCompiler extends PostgresQueryCompiler {
  protected override addParameter(parameter: unknown): void {
    if (parameter instanceof Date) {
      super.addParameter(parameter.toISOString())
      return
    }
    super.addParameter(parameter)
  }
}

export interface BunSQLDialectConfiguration {
  postgres: SQL
}

/**
 * Every `DATE` column reads as a `CalendarDay`.
 */
export class BunSQLDialect implements Dialect {
  readonly #postgres: SQL

  public constructor(configuration: BunSQLDialectConfiguration) {
    this.#postgres = configuration.postgres
  }

  public createAdapter(): PostgresAdapter {
    return new PostgresAdapter()
  }

  public createDriver(): BunSQLDriver {
    return new BunSQLDriver(this.#postgres)
  }

  public createIntrospector(database: Kysely<unknown>): PostgresIntrospector {
    return new PostgresIntrospector(database)
  }

  public createQueryCompiler(): PostgresQueryCompiler {
    return new BunSQLQueryCompiler()
  }
}

export const bigIntToNumberPlugin: KyselyPlugin = {
  transformQuery: (args) => {
    return args.node
  },
  transformResult: async (args) => {
    for (const row of args.result.rows) {
      for (const key in row) {
        const value = row[key]
        if (typeof value === "bigint") {
          row[key] = Number(value)
        }
      }
    }
    return args.result
  },
}
