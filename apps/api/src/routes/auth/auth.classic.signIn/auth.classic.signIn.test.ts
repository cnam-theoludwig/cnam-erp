import { call, ORPCError } from "@orpc/server"
import {
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_TYPE,
  ROUTE_AUTH_WEB_CALLBACK,
  ROUTE_AUTH_WEB_USER,
} from "@repo/models/AuthUser"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "@repo/models/I18n"
import { WEB_URL } from "@repo/utils/configuration"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../../_test/utils.ts"
import { createClassicUserTest, getTestContext } from "../../../_test/utils.ts"
import { apiRouter } from "../../router.ts"

const buildInput = (input: {
  email: string
  password: string
  callback?: string | null
}): ApiInputs["auth"]["classic"]["signIn"] => {
  return {
    body: {
      email: input.email,
      password: input.password,
      callback: input.callback ?? null,
      i18nLocale: I18N_LOCALE_DEFAULT,
      timezone: TIMEZONE_DEFAULT,
    },
  }
}

describe("auth.classic.signIn", () => {
  it('should return "UNAUTHORIZED" when the email is unknown', async () => {
    // Arrange - Given
    const input = buildInput({ email: "unknown@example.com", password: "any-password" })
    const context = getTestContext()

    // Act - When
    const output = call(apiRouter.auth.classic.signIn, input, { context })

    // Assert - Then
    const expected = new ORPCError("UNAUTHORIZED", { message: "Invalid email or password." })
    await assert.rejects(output, expected)
  })

  it('should return "UNAUTHORIZED" when the password is wrong', async () => {
    // Arrange - Given
    const user = await createClassicUserTest({ password: "correct-horse-battery" })
    const input = buildInput({ email: user.email, password: "wrong-password" })
    const context = getTestContext()

    // Act - When
    const output = call(apiRouter.auth.classic.signIn, input, { context })

    // Assert - Then
    const expected = new ORPCError("UNAUTHORIZED", { message: "Invalid email or password." })
    await assert.rejects(output, expected)
  })

  it("should redirect to the callback with an auth token that authenticates the user", async () => {
    // Arrange - Given
    const user = await createClassicUserTest({ password: "correct-horse-battery" })
    const input = buildInput({
      email: user.email,
      password: user.password,
      callback: ROUTE_AUTH_WEB_USER,
    })

    // Act - When
    const signInOutput = await call(apiRouter.auth.classic.signIn, input, {
      context: getTestContext(),
    })

    // Assert - Then
    const redirectURL = new URL(signInOutput.redirectURL)
    const authorization =
      `${AUTH_TOKEN_TYPE} ${redirectURL.searchParams.get(AUTH_COOKIE_NAME)}` as const
    const auth = await call(
      apiRouter.auth.get,
      { headers: { authorization } },
      { context: getTestContext({ authorization }) },
    )
    const output = {
      origin: redirectURL.origin,
      pathname: redirectURL.pathname,
      callback: redirectURL.searchParams.get("callback"),
      userId: auth.user.id,
    }
    const expected = {
      origin: new URL(WEB_URL).origin,
      pathname: ROUTE_AUTH_WEB_CALLBACK,
      callback: ROUTE_AUTH_WEB_USER,
      userId: user.userId,
    }
    assert.deepEqual(output, expected)
  })
})
