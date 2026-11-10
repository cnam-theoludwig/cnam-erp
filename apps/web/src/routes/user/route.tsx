import { ROUTE_AUTH_WEB_SIGN_IN } from "@repo/models/AuthUser"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/user")({
  beforeLoad: ({ context, location }) => {
    if (context.auth == null) {
      throw redirect({
        to: ROUTE_AUTH_WEB_SIGN_IN,
        search: { callback: location.href },
      })
    }
    return { auth: context.auth }
  },
})
