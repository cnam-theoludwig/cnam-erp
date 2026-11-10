import { database } from "../../../tools/database/database.ts"
import { authenticatedProcedure } from "../../../oRPC.ts"

export const authUpdateI18nLocaleRouter = authenticatedProcedure.auth.updateI18nLocale.handler(
  async ({ context, input }) => {
    await database
      .updateTable("User")
      .set({ i18nLocale: input.body.i18nLocale })
      .where("id", "=", context.auth.authJWT.userId)
      .executeTakeFirstOrThrow()
  },
)
