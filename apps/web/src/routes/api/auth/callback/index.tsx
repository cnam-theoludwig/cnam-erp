import {
  AUTH_COOKIE_NAME,
  CallbackZod,
  ROUTE_AUTH_WEB_SIGN_IN,
  ROUTE_AUTH_WEB_USER,
} from "@repo/models/AuthUser"
import { getDefaultCatchZod } from "@repo/models/Entity"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { setAuthCookie } from "../../../../auth.functions.ts"

export const Route = createFileRoute("/api/auth/callback/")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const searchParams = new URL(request.url).searchParams
        const authToken = searchParams.get(AUTH_COOKIE_NAME)
        if (authToken == null || authToken.length <= 0) {
          throw redirect({
            to: ROUTE_AUTH_WEB_SIGN_IN,
          })
        }
        setAuthCookie(authToken)
        const callback = getDefaultCatchZod(CallbackZod, null).parse(searchParams.get("callback"))
        throw redirect({
          to: callback ?? ROUTE_AUTH_WEB_USER,
        })
      },
    },
  },
})
