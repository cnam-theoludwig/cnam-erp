import { database } from "../../../tools/database/database.ts"
import { authenticatedProcedure } from "../../../oRPC.ts"

export const authUpdateTimezoneRouter = authenticatedProcedure.auth.updateTimezone.handler(
  async ({ context, input }) => {
    await database
      .updateTable("User")
      .set({
        timezone: input.body.timezone,
        timezoneAutoDetected: input.body.timezoneAutoDetected,
      })
      .where("id", "=", context.auth.authJWT.userId)
      .executeTakeFirstOrThrow()
  },
)
