import { oc } from "@orpc/contract"
import { AuthHeadersZodObject } from "@repo/models/AuthUser"
import { I18nLocaleZod } from "@repo/models/I18n"
import * as z from "zod"

export const authUpdateI18nLocaleContract = oc
  .route({
    method: "PUT",
    path: "/auth/user/i18nLocale",
    tags: ["Auth/User"],
    description: "Update the i18n locale of the current authenticated user.",
    inputStructure: "detailed",
  })
  .input(
    z.object({
      body: z.object({
        i18nLocale: I18nLocaleZod,
      }),
      headers: AuthHeadersZodObject,
    }),
  )
