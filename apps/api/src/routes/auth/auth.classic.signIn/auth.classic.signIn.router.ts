import { ORPCError } from "@orpc/server"
import { AUTH_PROVIDER_CLASSIC } from "@repo/models/AuthUser"
import { passwordHash, passwordNeedsRehash, passwordVerify } from "@repo/utils/crypto"
import { issueAuthSession } from "../../../domain/AuthUser/issueAuthSession.ts"
import { publicProcedure } from "../../../oRPC.ts"
import { database } from "../../../tools/database/database.ts"
import { getUserInfo } from "../../../tools/getUserInfo.ts"

export const authClassicSignInRouter = publicProcedure.auth.classic.signIn.handler(
  async ({ input, context }) => {
    const { email, password, callback, i18nLocale, timezone } = input.body

    const user = await database
      .selectFrom("User")
      .innerJoin("UserAccount", (join) => {
        return join
          .onRef("UserAccount.userId", "=", "User.id")
          .on("UserAccount.provider", "=", AUTH_PROVIDER_CLASSIC)
      })
      .select([
        "User.id",
        "User.timezoneAutoDetected",
        "UserAccount.id as userAccountId",
        "UserAccount.information as passwordHash",
      ])
      .where("User.email", "=", email)
      .executeTakeFirst()
    if (user == null) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Invalid email or password.",
      })
    }

    const isCorrectPassword = await passwordVerify(password, user.passwordHash)
    if (!isCorrectPassword) {
      throw new ORPCError("UNAUTHORIZED", {
        message: "Invalid email or password.",
      })
    }

    if (passwordNeedsRehash(user.passwordHash)) {
      const newPasswordHash = await passwordHash(password)
      await database
        .updateTable("UserAccount")
        .set({ information: newPasswordHash })
        .where("id", "=", user.userAccountId)
        .executeTakeFirstOrThrow()
    }

    const information = await getUserInfo({ context })
    const { redirectURL } = await issueAuthSession({
      userAccountId: user.userAccountId,
      userId: user.id,
      provider: AUTH_PROVIDER_CLASSIC,
      information,
      callback,
    })

    if (user.timezoneAutoDetected) {
      await database
        .updateTable("User")
        .set({ i18nLocale, timezone })
        .where("id", "=", user.id)
        .executeTakeFirstOrThrow()
    }

    return { redirectURL }
  },
)
