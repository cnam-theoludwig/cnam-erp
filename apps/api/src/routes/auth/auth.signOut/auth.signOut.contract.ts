import { oc } from "@orpc/contract"
import { AuthHeadersZodObject } from "@repo/models/AuthUser"
import { EntityZod } from "@repo/models/Entity"
import * as z from "zod"

export const authSignOutContract = {
  bySessionId: oc
    .route({
      method: "DELETE",
      path: "/auth/sign-out/{sessionId}",
      tags: ["Auth/SignOut"],
      description: "Sign out a specific authentication session.",
      inputStructure: "detailed",
    })
    .input(
      z.object({
        params: z.object({
          sessionId: EntityZod.id,
        }),
        headers: AuthHeadersZodObject,
      }),
    ),

  allSessions: oc
    .route({
      method: "DELETE",
      path: "/auth/sign-out-all",
      tags: ["Auth/SignOut"],
      description: "Sign out all authentication sessions for the current user.",
      inputStructure: "detailed",
    })
    .input(
      z.object({
        headers: AuthHeadersZodObject,
      }),
    ),
}
