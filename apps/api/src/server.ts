const beforeTimeMs = performance.now()

import "zod/compile"
import { OpenAPIHandler } from "@orpc/openapi/fetch"
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins"
import { onError, ORPCError } from "@orpc/server"
import { CORSPlugin, RequestHeadersPlugin, ResponseHeadersPlugin } from "@orpc/server/plugins"
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4"
import { API_URL, IS_PRODUCTION, MEGABYTE, NAME, VERSION, WEB_URL } from "@repo/utils/configuration"
import {
  calculateMillisecondsFromDuration,
  calculateSecondsFromDuration,
  prettyMilliseconds,
} from "@repo/utils/date"
import Bun from "bun"
import util from "node:util"
import { HOST, PORT } from "./configuration.ts"
import { apiRouter } from "./routes/router.ts"
import { cleanup, startDraining } from "./tools/cleanup.ts"
import { queueInit, queueStartWorker } from "./tools/queue.ts"

const openAPIHandler = new OpenAPIHandler(apiRouter, {
  interceptors: [
    onError((error) => {
      if (!(error instanceof ORPCError)) {
        console.error(error)
      }
    }),
  ],
  plugins: [
    new RequestHeadersPlugin(),
    new ResponseHeadersPlugin(),
    new CORSPlugin({
      origin: WEB_URL,
      credentials: true,
      exposeHeaders: ["Content-Disposition"],
    }),
    new OpenAPIReferencePlugin({
      docsProvider: "scalar",
      docsTitle: `${NAME} API`,
      docsHead: `<meta name="robots" content="noindex, nofollow" />`,
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: NAME,
          version: VERSION,
        },
        servers: [{ url: API_URL }],
      },
    }),
  ],
})

await queueInit()
await queueStartWorker()

const server = Bun.serve({
  hostname: HOST,
  port: PORT,
  maxRequestBodySize: MEGABYTE,
  idleTimeout: calculateSecondsFromDuration({ duration: { amount: 2, unit: "minute" } }),
  fetch: async (request) => {
    const { matched, response } = await openAPIHandler.handle(request)
    if (matched) {
      return response
    }
    return new Response("Not Found", { status: 404 })
  },
  error: (error) => {
    console.error(error)
    return new Response("Internal server error.", { status: 500 })
  },
})

let isShuttingDown = false

const DRAIN_DELAY_MS = calculateMillisecondsFromDuration({
  duration: {
    amount: 10,
    unit: "second",
  },
})

const gracefulShutdown = async (): Promise<void> => {
  if (isShuttingDown) {
    return
  }
  isShuttingDown = true
  startDraining()
  if (IS_PRODUCTION) {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, DRAIN_DELAY_MS)
    })
  }
  await server.stop(true)
  await cleanup()
  process.exit(0)
}
process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)

const elapsedTimeMs = performance.now() - beforeTimeMs
console.log(
  `API ${util.styleText("bold", `v${VERSION}`)} listening at ${util.styleText("cyan", server.url.origin)}`,
)
console.log(`Ready in ${prettyMilliseconds(elapsedTimeMs)}`)
console.log()
