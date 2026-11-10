import { oc } from "@orpc/contract"
import { APIKeyHeadersZodObject } from "@repo/models/AuthUser"
import * as z from "zod"

export const ROUTE_HEALTH = "/health"

export const healthContract = oc
  .route({
    method: "GET",
    path: ROUTE_HEALTH,
    tags: ["Health"],
    description: "Check the health of the API service.",
    inputStructure: "detailed",
  })
  .input(
    z.object({
      headers: APIKeyHeadersZodObject,
    }),
  )
  .output(
    z.object({
      data: z.object({
        version: z.coerce.string<string>(),
        isHealthy: z.coerce.boolean<boolean>(),
        status: z.enum(["error", "ok", "warning"]),
        finishedAt: z.coerce.date<Date>(),
        debugInfo: z.unknown().nullish(),
        checks: z.array(z.unknown()).nullish(),
      }),
    }),
  )
