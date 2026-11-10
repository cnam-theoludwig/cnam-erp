import { ORPCError } from "@orpc/server"
import { AUTH_PROVIDER_CLASSIC } from "@repo/models/AuthUser"
import { passwordHash } from "@repo/utils/crypto"
import { publicProcedure } from "../../../oRPC.ts"
import { database } from "../../../tools/database/database.ts"

export const authPasswordResetRouter = publicProcedure.auth.password.reset.handler(
  async ({ input }) => {
    const { token, password } = input.body

    const user = await database
      .selectFrom("User")
      .select(["User.id", "User.email", "User.temporaryTokenExpirationDate"])
      .where("User.temporaryToken", "=", token)
      .executeTakeFirst()
    if (user == null) {
      throw new ORPCError("BAD_REQUEST", {
        message: "The password reset token is invalid.",
      })
    }

    const isValid =
      user.temporaryTokenExpirationDate != null &&
      user.temporaryTokenExpirationDate.getTime() > Date.now()
    if (!isValid) {
      throw new ORPCError("BAD_REQUEST", {
        message: "The password reset token is expired.",
      })
    }

    const passwordHashed = await passwordHash(password)
    await database.transaction().execute(async (transaction) => {
      await transaction
        .updateTable("User")
        .set({
          temporaryToken: null,
          temporaryTokenExpirationDate: null,
        })
        .where("id", "=", user.id)
        .executeTakeFirstOrThrow()
      await transaction
        .insertInto("UserAccount")
        .values({
          userId: user.id,
          provider: AUTH_PROVIDER_CLASSIC,
          providerAccountId: user.id,
          information: passwordHashed,
        })
        .onConflict((onConflict) => {
          return onConflict.columns(["provider", "providerAccountId"]).doUpdateSet({
            information: passwordHashed,
          })
        })
        .executeTakeFirstOrThrow()
      await transaction
        .deleteFrom("UserAccountSession")
        .where("userAccountId", "in", (expression) => {
          return expression.selectFrom("UserAccount").select("id").where("userId", "=", user.id)
        })
        .execute()
    })

    return { email: user.email }
  },
)
