import { ROUTE_AUTH_WEB_USER } from "@repo/models/AuthUser"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/auth")({
  beforeLoad: ({ context }) => {
    if (context.auth != null) {
      throw redirect({
        to: ROUTE_AUTH_WEB_USER,
      })
    }
  },
})
