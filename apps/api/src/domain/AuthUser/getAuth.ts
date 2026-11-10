import type { AuthAuthorization, AuthJWT } from "@repo/models/AuthUser"
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_TOKEN_TYPE,
  AuthJWTZodObject,
  JWT_ALG,
} from "@repo/models/AuthUser"
import type { Duration } from "@repo/utils/date"
import { calculateDate } from "@repo/utils/date"
import * as jose from "jose"
import { AUTH_SECRET } from "../../configuration.ts"
import type { ORPCContext } from "../../oRPC.ts"
import { database } from "../../tools/database/database.ts"

export const SESSION_LAST_USED_REFRESH_INTERVAL = {
  amount: 5,
  unit: "minute",
} as const satisfies Duration

export interface GetAuthInput {
  context: ORPCContext
}

export type GetAuthOutput = {
  authJWT: AuthJWT
  authorization: AuthAuthorization
} | null

export const getAuthWithAuthorization = async (authorization: string): Promise<GetAuthOutput> => {
  const [type, token] = authorization.split(" ")
  if (type !== AUTH_TOKEN_TYPE || token == null) {
    return null
  }

  let authJWT: AuthJWT
  try {
    const { payload } = await jose.jwtVerify(token, new TextEncoder().encode(AUTH_SECRET), {
      algorithms: [JWT_ALG],
      maxTokenAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    })
    const parsed = AuthJWTZodObject.safeParse(payload)
    if (!parsed.success) {
      return null
    }
    authJWT = parsed.data
  } catch {
    return null
  }

  const now = new Date()
  const lastUsedRefreshThreshold = calculateDate({
    date: new Date(now),
    duration: {
      amount: -SESSION_LAST_USED_REFRESH_INTERVAL.amount,
      unit: SESSION_LAST_USED_REFRESH_INTERVAL.unit,
    },
  })
  const session = await database
    .with("Session", (query) => {
      return query
        .selectFrom("UserAccountSession")
        .innerJoin("UserAccount", "UserAccount.id", "UserAccountSession.userAccountId")
        .select(["UserAccountSession.id", "UserAccountSession.lastUsed"])
        .where("UserAccountSession.id", "=", authJWT.sessionId)
        .where("UserAccount.userId", "=", authJWT.userId)
    })
    .with("RefreshedSession", (query) => {
      return query
        .updateTable("UserAccountSession")
        .set({ lastUsed: now })
        .where("UserAccountSession.id", "in", (subquery) => {
          return subquery
            .selectFrom("Session")
            .select("Session.id")
            .where("Session.lastUsed", "<", lastUsedRefreshThreshold)
        })
        .returning(["UserAccountSession.id"])
    })
    .selectFrom("Session")
    .select(["Session.id"])
    .executeTakeFirst()
  if (session == null) {
    return null
  }
  return {
    authJWT,
    authorization: authorization as AuthAuthorization,
  }
}

export const getAuthorizationHeader = (input: GetAuthInput): AuthAuthorization | null => {
  const { context } = input
  const authorization = context.reqHeaders?.get("authorization")
  if (typeof authorization !== "string") {
    return null
  }
  return authorization as AuthAuthorization
}

export const getAuth = async (input: GetAuthInput): Promise<GetAuthOutput> => {
  const authorization = getAuthorizationHeader(input)
  if (authorization == null) {
    return null
  }
  return await getAuthWithAuthorization(authorization)
}
