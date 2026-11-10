import crypto from "node:crypto"
import { call, ORPCError } from "@orpc/server"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "@repo/models/I18n"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../../_test/utils.ts"
import {
  createAuthTest,
  expireUserTemporaryToken,
  getTestContext,
  getUserTemporaryToken,
  signInClassicTest,
} from "../../../_test/utils.ts"
import { apiRouter } from "../../router.ts"

const requestPasswordReset = async (email: string): Promise<void> => {
  await call(
    apiRouter.auth.password.forgot,
    { body: { email, i18nLocale: I18N_LOCALE_DEFAULT, timezone: TIMEZONE_DEFAULT } },
    { context: getTestContext() },
  )
}

describe("auth.password.reset", () => {
  it('should return "BAD_REQUEST" when the token is unknown', async () => {
    // Arrange - Given
    const input: ApiInputs["auth"]["password"]["reset"] = {
      body: { token: crypto.randomUUIDv7(), password: "new-password-123" },
    }
    const context = getTestContext()

    // Act - When
    const output = call(apiRouter.auth.password.reset, input, { context })

    // Assert - Then
    const expected = new ORPCError("BAD_REQUEST", {
      message: "The password reset token is invalid.",
    })
    await assert.rejects(output, expected)
  })

  it('should return "BAD_REQUEST" when the token is expired', async () => {
    // Arrange - Given
    const user = await createAuthTest()
    await requestPasswordReset(user.email)
    await expireUserTemporaryToken(user.userId)
    const input: ApiInputs["auth"]["password"]["reset"] = {
      body: { token: await getUserTemporaryToken(user.userId), password: "new-password-123" },
    }
    const context = getTestContext()

    // Act - When
    const output = call(apiRouter.auth.password.reset, input, { context })

    // Assert - Then
    const expected = new ORPCError("BAD_REQUEST", {
      message: "The password reset token is expired.",
    })
    await assert.rejects(output, expected)
  })

  it("should set the new password and revoke every existing session", async () => {
    // Arrange - Given
    const user = await createAuthTest()
    await requestPasswordReset(user.email)
    const newPassword = "new-password-123"
    const input: ApiInputs["auth"]["password"]["reset"] = {
      body: { token: await getUserTemporaryToken(user.userId), password: newPassword },
    }

    // Act - When
    const output = await call(apiRouter.auth.password.reset, input, {
      context: getTestContext(),
    })

    // Assert - Then
    const expected = { email: user.email }
    assert.deepEqual(output, expected)
    await signInClassicTest({ email: user.email, password: newPassword })
    await assert.rejects(
      call(
        apiRouter.auth.get,
        { headers: { authorization: user.authorization } },
        { context: getTestContext({ authorization: user.authorization }) },
      ),
      new ORPCError("UNAUTHORIZED"),
    )
  })
})
