import { oc } from "@orpc/contract"
import { PasswordResetZodObject, UserZod } from "@repo/models/AuthUser"
import * as z from "zod"

export const authPasswordResetContract = oc
  .route({
    method: "POST",
    path: "/auth/password/reset",
    tags: ["Auth/Password"],
    description: "Reset the password with a valid token.",
    inputStructure: "detailed",
  })
  .input(
    z.object({
      body: PasswordResetZodObject,
    }),
  )
  .output(
    z.object({
      email: UserZod.email,
    }),
  )
