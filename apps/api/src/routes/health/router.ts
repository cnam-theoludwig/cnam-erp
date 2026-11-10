import {
  BaseCheck,
  DiskSpaceCheck,
  HealthChecks,
  MemoryHeapCheck,
  MemoryRSSCheck,
  Result,
} from "@adonisjs/health"
import type { HealthCheckResult } from "@adonisjs/health/types"
import { ORPCError } from "@orpc/server"
import { API_KEY_HEADER_NAME, VERSION } from "@repo/utils/configuration"
import { getIsApiKeyValid } from "@repo/utils/crypto"
import { sql } from "kysely"
import { baseProcedure } from "../../oRPC.ts"
import { getIsDraining } from "../../tools/cleanup.ts"
import { DATABASE_DIALECT } from "../../tools/database/configuration.ts"
import { database } from "../../tools/database/database.ts"
import { redis } from "../../tools/redis.ts"

class DatabaseCheck extends BaseCheck {
  public name = "Database health check"

  async #ping(): Promise<void> {
    const { result } = await database
      .selectNoFrom((expression) => {
        return [expression(sql.lit(1), "+", sql.lit(1)).as("result")]
      })
      .executeTakeFirstOrThrow()
    if (result !== 2) {
      throw new Error("Unexpected database response.")
    }
  }

  public async run(): Promise<HealthCheckResult> {
    const metadata = {
      dialect: DATABASE_DIALECT,
    }
    try {
      await this.#ping()
      return Result.ok("Successfully connected to the database server").mergeMetaData(metadata)
    } catch (error) {
      if (error instanceof Error) {
        return Result.failed(error.message, error).mergeMetaData(metadata)
      }
      return Result.failed("Connection failed").mergeMetaData(metadata)
    }
  }
}

class RedisCheck extends BaseCheck {
  public name = "Redis health check"

  async #ping(): Promise<void> {
    const pong = await redis.ping()
    if (pong !== "PONG") {
      throw new Error("Unexpected redis response.")
    }
  }

  public async run(): Promise<HealthCheckResult> {
    try {
      await this.#ping()
      return Result.ok("Successfully connected to the redis server")
    } catch (error) {
      if (error instanceof Error) {
        return Result.failed(error.message, error)
      }
      return Result.failed("Connection failed")
    }
  }
}

const healthChecks = new HealthChecks().register([
  new MemoryHeapCheck()
    .warnWhenExceedsPercentage(85)
    .failWhenExceedsPercentage(95)
    .cacheFor("15 seconds"),
  new MemoryRSSCheck()
    .warnWhenExceedsPercentage(85)
    .failWhenExceedsPercentage(95)
    .cacheFor("15 seconds"),
  new DiskSpaceCheck().cacheFor("1 hour"),
  new DatabaseCheck().cacheFor("1 minute"),
  new RedisCheck().cacheFor("1 minute"),
])

export const healthRouter = baseProcedure.health.handler(async ({ input }) => {
  if (getIsDraining()) {
    throw new ORPCError("SERVICE_UNAVAILABLE", {
      data: { version: VERSION, isHealthy: false, status: "draining" },
    })
  }
  const reportFull = await healthChecks.run()
  let report = {
    version: VERSION,
    isHealthy: reportFull.isHealthy,
    status: reportFull.status,
    finishedAt: reportFull.finishedAt,
  }
  if (getIsApiKeyValid(input.headers[API_KEY_HEADER_NAME])) {
    report = {
      version: VERSION,
      ...reportFull,
    }
  }
  if (report.isHealthy) {
    return {
      data: report,
    }
  }
  throw new ORPCError("SERVICE_UNAVAILABLE", {
    data: report,
  })
})
