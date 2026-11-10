import { oc } from "@orpc/contract"
import { PasswordForgotZodObject } from "@repo/models/AuthUser"
import * as z from "zod"

export const authPasswordForgotContract = oc
  .route({
    method: "POST",
    path: "/auth/password/forgot",
    tags: ["Auth/Password"],
    description: "Request a password reset email.",
    inputStructure: "detailed",
  })
  .input(
    z.object({
      body: PasswordForgotZodObject,
    }),
  )
