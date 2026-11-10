import { oc } from "@orpc/contract"
import { AuthHeadersZodObject, UserUpdateEmailZodObject } from "@repo/models/AuthUser"
import { EntityZod } from "@repo/models/Entity"
import * as z from "zod"

export const authEmailContract = {
  update: oc
    .route({
      method: "PUT",
      path: "/auth/user/email",
      tags: ["Auth/User"],
      description: "Update the email address of the current authenticated user.",
      inputStructure: "detailed",
    })
    .input(
      z.object({
        body: UserUpdateEmailZodObject,
        headers: AuthHeadersZodObject,
      }),
    ),
  cancelPending: oc
    .route({
      method: "DELETE",
      path: "/auth/user/email/pending",
      tags: ["Auth/User"],
      description: "Cancel the pending email change.",
      inputStructure: "detailed",
    })
    .input(
      z.object({
        headers: AuthHeadersZodObject,
      }),
    ),
  verify: oc
    .route({
      method: "GET",
      path: "/auth/user/email-verify",
      tags: ["Auth/User"],
      description: "Verify the email address.",
      successStatus: 302,
      inputStructure: "detailed",
    })
    .input(
      z.object({
        query: z.object({
          token: EntityZod.id,
        }),
      }),
    ),
}
