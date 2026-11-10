import { authenticatedProcedure } from "../../../oRPC.ts"
import { database } from "../../../tools/database/database.ts"

export const authGetRouter = authenticatedProcedure.auth.get.handler(async ({ context }) => {
  const user = await database
    .selectFrom("User")
    .select([
      "User.id",
      "User.displayName",
      "User.email",
      "User.emailPending",
      "User.i18nLocale",
      "User.timezone",
      "User.timezoneAutoDetected",
      "User.createdAt",
    ])
    .where("id", "=", context.auth.authJWT.userId)
    .executeTakeFirstOrThrow()
  return {
    authJWT: context.auth.authJWT,
    authorization: context.auth.authorization,
    user,
  }
})
