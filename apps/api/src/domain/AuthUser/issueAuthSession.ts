import type { AuthProvider, Callback, User, UserAccount } from "@repo/models/AuthUser"
import { AUTH_COOKIE_NAME, ROUTE_AUTH_WEB_CALLBACK } from "@repo/models/AuthUser"
import { WEB_URL } from "@repo/utils/configuration"
import type { IResult } from "ua-parser-js"
import { database } from "../../tools/database/database.ts"
import { signAuthJWT } from "./signAuthJWT.ts"

interface IssueAuthSessionInput {
  userAccountId: UserAccount["id"]
  userId: User["id"]
  provider: AuthProvider
  information: IResult | null
  callback: Callback
}

interface IssueAuthSessionOutput {
  redirectURL: string
}

export const issueAuthSession = async (
  input: IssueAuthSessionInput,
): Promise<IssueAuthSessionOutput> => {
  const userAccountSession = await database
    .insertInto("UserAccountSession")
    .values({
      userAccountId: input.userAccountId,
      information: input.information,
    })
    .returning(["id"])
    .executeTakeFirstOrThrow()

  const authToken = await signAuthJWT({
    provider: input.provider,
    userId: input.userId,
    sessionId: userAccountSession.id,
  })

  const redirectURL = new URL(ROUTE_AUTH_WEB_CALLBACK, WEB_URL)
  redirectURL.searchParams.set(AUTH_COOKIE_NAME, authToken)
  if (input.callback != null) {
    redirectURL.searchParams.set("callback", input.callback)
  }

  return { redirectURL: redirectURL.toString() }
}
