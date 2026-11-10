import { database } from "../../../tools/database/database.ts"
import { authenticatedProcedure } from "../../../oRPC.ts"

export const authSignOutRouter = {
  bySessionId: authenticatedProcedure.auth.signOut.bySessionId.handler(
    async ({ context, input }) => {
      await database
        .deleteFrom("UserAccountSession")
        .where("id", "=", input.params.sessionId)
        .where((expression) => {
          return expression.exists(
            expression
              .selectFrom("UserAccount")
              .select("id")
              .whereRef("UserAccount.id", "=", "UserAccountSession.userAccountId")
              .where("UserAccount.userId", "=", context.auth.authJWT.userId),
          )
        })
        .executeTakeFirstOrThrow()
    },
  ),

  allSessions: authenticatedProcedure.auth.signOut.allSessions.handler(async ({ context }) => {
    await database
      .deleteFrom("UserAccountSession")
      .where((expression) => {
        return expression.exists(
          expression
            .selectFrom("UserAccount")
            .select("id")
            .whereRef("UserAccount.id", "=", "UserAccountSession.userAccountId")
            .where("UserAccount.userId", "=", context.auth.authJWT.userId),
        )
      })
      .executeTakeFirstOrThrow()
  }),
}
