import { ROUTE_AUTH_WEB_SIGN_IN, ROUTE_AUTH_WEB_USER } from "@repo/models/AuthUser"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    throw redirect({
      to: context.auth == null ? ROUTE_AUTH_WEB_SIGN_IN : ROUTE_AUTH_WEB_USER,
    })
  },
})
