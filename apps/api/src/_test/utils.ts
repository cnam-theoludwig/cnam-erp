import crypto from "node:crypto"
import type { InferContractRouterInputs } from "@orpc/contract"
import { call } from "@orpc/server"
import type { AuthAuthorization, User } from "@repo/models/AuthUser"
import { AUTH_COOKIE_NAME, AUTH_PROVIDER_CLASSIC, AUTH_TOKEN_TYPE } from "@repo/models/AuthUser"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "@repo/models/I18n"
import { passwordHash } from "@repo/utils/crypto"
import { calculateDate } from "@repo/utils/date"
import type { ORPCContext } from "../oRPC.ts"
import type { apiContract } from "../routes/contract.ts"
import { apiRouter } from "../routes/router.ts"
import { database } from "../tools/database/database.ts"

export type ApiInputs = InferContractRouterInputs<typeof apiContract>

export const getTestContext = (
  headers?: Record<string, string | null | undefined>,
): ORPCContext => {
  const reqHeaders = new Headers()
  if (headers != null) {
    for (const [key, value] of Object.entries(headers)) {
      if (value != null) {
        reqHeaders.set(key, value)
      }
    }
  }
  return {
    reqHeaders,
    resHeaders: new Headers(),
  }
}

export interface CreateClassicUserTestInput {
  password: string
  email?: string
  displayName?: User["displayName"]
}
export interface CreateClassicUserTestOutput {
  userId: User["id"]
  email: string
  password: string
}
export const createClassicUserTest = async (
  input: CreateClassicUserTestInput,
): Promise<CreateClassicUserTestOutput> => {
  const id = crypto.randomUUIDv7()
  const email = input.email ?? `classic-${id}@example.com`
  const passwordHashed = await passwordHash(input.password)
  await database.transaction().execute(async (transaction) => {
    await transaction
      .insertInto("User")
      .values({
        id,
        displayName: input.displayName ?? `Classic ${id.slice(0, 8)}`,
        i18nLocale: I18N_LOCALE_DEFAULT,
        email,
      })
      .executeTakeFirstOrThrow()
    await transaction
      .insertInto("UserAccount")
      .values({
        userId: id,
        provider: AUTH_PROVIDER_CLASSIC,
        providerAccountId: id,
        information: passwordHashed,
      })
      .executeTakeFirstOrThrow()
  })
  return { userId: id, email, password: input.password }
}

export interface SignInClassicTestInput {
  email: string
  password: string
}
export interface SignInClassicTestOutput {
  authorization: AuthAuthorization
}
export const signInClassicTest = async (
  input: SignInClassicTestInput,
): Promise<SignInClassicTestOutput> => {
  const signInOutput = await call(
    apiRouter.auth.classic.signIn,
    {
      body: {
        email: input.email,
        password: input.password,
        callback: null,
        i18nLocale: I18N_LOCALE_DEFAULT,
        timezone: TIMEZONE_DEFAULT,
      },
    },
    { context: getTestContext() },
  )
  const authToken = new URL(signInOutput.redirectURL).searchParams.get(AUTH_COOKIE_NAME)
  if (authToken == null) {
    throw new Error(`missing "${AUTH_COOKIE_NAME}" in "redirectURL"`)
  }
  return { authorization: `${AUTH_TOKEN_TYPE} ${authToken}` }
}

export interface CreateAuthTestInput extends Partial<CreateClassicUserTestInput> {}
export interface CreateAuthTestOutput
  extends CreateClassicUserTestOutput, SignInClassicTestOutput {}
export const createAuthTest = async (
  input: CreateAuthTestInput = {},
): Promise<CreateAuthTestOutput> => {
  const user = await createClassicUserTest({ password: "password-test", ...input })
  const { authorization } = await signInClassicTest(user)
  return { ...user, authorization }
}

export const getUserTemporaryToken = async (userId: User["id"]): Promise<string> => {
  const user = await database
    .selectFrom("User")
    .select(["temporaryToken"])
    .where("id", "=", userId)
    .executeTakeFirstOrThrow()
  if (user.temporaryToken == null) {
    throw new Error(`User "${userId}" has no temporary token.`)
  }
  return user.temporaryToken
}

export const expireUserTemporaryToken = async (userId: User["id"]): Promise<void> => {
  await database
    .updateTable("User")
    .set({
      temporaryTokenExpirationDate: calculateDate({
        date: new Date(),
        duration: { amount: -1, unit: "minute" },
      }),
    })
    .where("id", "=", userId)
    .executeTakeFirstOrThrow()
}
