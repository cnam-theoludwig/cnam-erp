import crypto from "node:crypto"
import { AUTH_PROVIDER_CLASSIC, PASSWORD_RESET_TOKEN_DURATION } from "@repo/models/AuthUser"
import { emailBase } from "@repo/models/Email"
import { calculateDate } from "@repo/utils/date"
import { SendEmailJob } from "../../../jobs/SendEmailJob.ts"
import { publicProcedure } from "../../../oRPC.ts"
import { database } from "../../../tools/database/database.ts"

export const authPasswordForgotRouter = publicProcedure.auth.password.forgot.handler(
  async ({ input }) => {
    const { email, i18nLocale, timezone } = input.body

    const user = await database
      .selectFrom("User")
      .innerJoin("UserAccount", (join) => {
        return join
          .onRef("UserAccount.userId", "=", "User.id")
          .on("UserAccount.provider", "=", AUTH_PROVIDER_CLASSIC)
      })
      .select(["User.id", "User.displayName"])
      .where("User.email", "=", email)
      .executeTakeFirst()
    if (user == null) {
      return
    }

    const temporaryToken = crypto.randomUUIDv7()
    const temporaryTokenExpirationDate = calculateDate({
      date: new Date(),
      duration: PASSWORD_RESET_TOKEN_DURATION,
    })
    await database
      .updateTable("User")
      .set({
        temporaryToken,
        temporaryTokenExpirationDate,
      })
      .where("id", "=", user.id)
      .executeTakeFirstOrThrow()

    await SendEmailJob.dispatch({
      type: "AuthPasswordReset",
      input: {
        ...emailBase({ i18nLocale, timezone }),
        userDisplayName: user.displayName,
        temporaryToken,
        temporaryTokenExpirationDate,
        durationAmount: PASSWORD_RESET_TOKEN_DURATION.amount,
        durationUnit: PASSWORD_RESET_TOKEN_DURATION.unit,
      },
      toEmail: email,
      userId: user.id,
    })
  },
)
