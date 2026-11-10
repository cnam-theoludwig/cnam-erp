import { oc } from "@orpc/contract"
import { AuthHeadersZodObject, AuthStateZodObject } from "@repo/models/AuthUser"
import * as z from "zod"

export const authGetContract = oc
  .route({
    method: "GET",
    path: "/auth/user",
    tags: ["Auth/User"],
    description: "Get the information of the current authenticated user.",
    inputStructure: "detailed",
  })
  .input(
    z.object({
      headers: AuthHeadersZodObject,
    }),
  )
  .output(AuthStateZodObject)
