import { oc } from "@orpc/contract"
import { AuthHeadersZodObject, UserZod } from "@repo/models/AuthUser"
import { TimezoneZod } from "@repo/models/I18n"
import * as z from "zod"

export const authUpdateTimezoneContract = oc
  .route({
    method: "PUT",
    path: "/auth/user/timezone",
    tags: ["Auth/User"],
    description: "Update the timezone of the current authenticated user.",
    inputStructure: "detailed",
  })
  .input(
    z.object({
      body: z.object({
        timezone: TimezoneZod,
        timezoneAutoDetected: UserZod.timezoneAutoDetected,
      }),
      headers: AuthHeadersZodObject,
    }),
  )
