import { VERSION } from "@repo/utils/configuration"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/health/")({
  server: {
    handlers: {
      GET: () => {
        return Response.json({
          data: {
            version: VERSION,
            isHealthy: true,
            status: "ok",
            finishedAt: new Date(),
          },
        })
      },
    },
  },
})
