import crypto from "node:crypto"
import { ORPCError } from "@orpc/server"
import { EMAIL_VERIFICATION_TOKEN_DURATION, ROUTE_AUTH_WEB_USER } from "@repo/models/AuthUser"
import { emailBase } from "@repo/models/Email"
import { API_URL, WEB_URL } from "@repo/utils/configuration"
import { calculateDate } from "@repo/utils/date"
import { SendEmailJob } from "../../../jobs/SendEmailJob.ts"
import { authenticatedProcedure, publicProcedure } from "../../../oRPC.ts"
import { database } from "../../../tools/database/database.ts"

export const authEmailRouter = {
  update: authenticatedProcedure.auth.email.update.handler(async ({ context, input }) => {
    const { email } = input.body
    const userId = context.auth.authJWT.userId

    const emailAlreadyTaken = await database
      .selectFrom("User")
      .select(["id"])
      .where((expression) => {
        return expression.or([
          expression("email", "=", email),
          expression.and([expression("emailPending", "=", email), expression("email", "is", null)]),
        ])
      })
      .where("id", "!=", userId)
      .executeTakeFirst()
    if (emailAlreadyTaken != null) {
      throw new ORPCError("CONFLICT", {
        message: "The provided email is already in use.",
      })
    }

    const temporaryToken = crypto.randomUUIDv7()
    const temporaryTokenExpirationDate = calculateDate({
      date: new Date(),
      duration: EMAIL_VERIFICATION_TOKEN_DURATION,
    })
    const user = await database.transaction().execute(async (transaction) => {
      await transaction
        .updateTable("User")
        .set({
          emailPending: null,
          temporaryToken: null,
          temporaryTokenExpirationDate: null,
        })
        .where("User.emailPending", "=", email)
        .where("User.email", "is not", null)
        .execute()
      return await transaction
        .updateTable("User")
        .set({
          emailPending: email,
          temporaryToken,
          temporaryTokenExpirationDate,
        })
        .where("id", "=", userId)
        .returning(["email", "i18nLocale", "timezone"])
        .executeTakeFirstOrThrow()
    })

    await SendEmailJob.dispatch({
      type: "AuthEmailVerify",
      input: {
        ...emailBase(user),
        apiURL: API_URL,
        email,
        temporaryToken,
        temporaryTokenExpirationDate,
      },
      toEmail: email,
      userId,
    })
    if (user.email != null) {
      await SendEmailJob.dispatch({
        type: "AuthEmailUpdateWarning",
        input: {
          ...emailBase(user),
          emailOld: user.email,
          emailPending: email,
        },
        toEmail: user.email,
        userId,
      })
    }
  }),
  cancelPending: authenticatedProcedure.auth.email.cancelPending.handler(async ({ context }) => {
    const user = await database
      .updateTable("User")
      .set({
        emailPending: null,
        temporaryToken: null,
        temporaryTokenExpirationDate: null,
      })
      .where("id", "=", context.auth.authJWT.userId)
      .where("emailPending", "is not", null)
      .returning(["id"])
      .executeTakeFirst()
    if (user == null) {
      throw new ORPCError("BAD_REQUEST", {
        message: "There is no pending email change to cancel.",
      })
    }
  }),
  verify: publicProcedure.auth.email.verify.handler(async ({ input, context }) => {
    const user = await database
      .selectFrom("User")
      .select(["id", "emailPending", "temporaryTokenExpirationDate"])
      .where("temporaryToken", "=", input.query.token)
      .executeTakeFirst()
    if (user == null) {
      throw new ORPCError("BAD_REQUEST", {
        message: "The email verification token is invalid.",
      })
    }
    const isValidTemporaryToken =
      user.temporaryTokenExpirationDate != null &&
      user.temporaryTokenExpirationDate.getTime() > Date.now()
    if (!isValidTemporaryToken) {
      throw new ORPCError("BAD_REQUEST", {
        message: "The email verification token is expired.",
      })
    }
    if (user.emailPending == null) {
      throw new ORPCError("BAD_REQUEST", {
        message: "There is no pending email to verify.",
      })
    }
    await database
      .updateTable("User")
      .set({
        email: user.emailPending,
        emailPending: null,
        temporaryToken: null,
        temporaryTokenExpirationDate: null,
      })
      .where("id", "=", user.id)
      .executeTakeFirstOrThrow()
    context.resHeaders?.append("location", new URL(ROUTE_AUTH_WEB_USER, WEB_URL).toString())
  }),
}
