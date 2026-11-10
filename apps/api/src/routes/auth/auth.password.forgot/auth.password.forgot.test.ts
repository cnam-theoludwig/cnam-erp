import { QueueManager } from "@boringnode/queue"
import { call } from "@orpc/server"
import type { EmailInput } from "@repo/models/Email"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "@repo/models/I18n"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../../_test/utils.ts"
import {
  createClassicUserTest,
  getTestContext,
  getUserTemporaryToken,
} from "../../../_test/utils.ts"
import { SendEmailJob } from "../../../jobs/SendEmailJob.ts"
import { apiRouter } from "../../router.ts"

const buildInput = (email: string): ApiInputs["auth"]["password"]["forgot"] => {
  return {
    body: {
      email,
      i18nLocale: I18N_LOCALE_DEFAULT,
      timezone: TIMEZONE_DEFAULT,
    },
  }
}

describe("auth.password.forgot", () => {
  it("should silently succeed without sending an email when the email is unknown", async () => {
    // Arrange - Given
    const fake = QueueManager.fake()
    const input = buildInput("unknown@example.com")
    const context = getTestContext()

    // Act - When
    const output = await call(apiRouter.auth.password.forgot, input, { context })

    // Assert - Then
    const expected = undefined
    assert.strictEqual(output, expected)
    fake.assertNothingPushed()
  })

  it("should email a password reset token to the user", async () => {
    // Arrange - Given
    const fake = QueueManager.fake()
    const user = await createClassicUserTest({ password: "password-test" })
    const input = buildInput(user.email)
    const context = getTestContext()

    // Act - When
    await call(apiRouter.auth.password.forgot, input, { context })

    // Assert - Then
    const temporaryToken = await getUserTemporaryToken(user.userId)
    fake.assertPushed(SendEmailJob, {
      payload: (payload: EmailInput) => {
        return (
          payload.type === "AuthPasswordReset" &&
          payload.toEmail === user.email &&
          payload.input.temporaryToken === temporaryToken
        )
      },
    })
    fake.assertPushedCount(1)
  })
})
