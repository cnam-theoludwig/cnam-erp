import { oc } from "@orpc/contract"
import { ClassicSignInResponseZodObject, UserSignInClassicZodObject } from "@repo/models/AuthUser"
import * as z from "zod"

export const authClassicSignInContract = oc
  .route({
    method: "POST",
    path: "/auth/classic/sign-in",
    tags: ["Auth/Classic"],
    description: "Sign in with email and password.",
    inputStructure: "detailed",
  })
  .input(
    z.object({
      body: UserSignInClassicZodObject,
    }),
  )
  .output(ClassicSignInResponseZodObject)
