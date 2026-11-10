import { QueueManager } from "@boringnode/queue"
import { call, ORPCError } from "@orpc/server"
import type { EmailInput } from "@repo/models/Email"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../../_test/utils.ts"
import {
  createAuthTest,
  expireUserTemporaryToken,
  getTestContext,
  getUserTemporaryToken,
} from "../../../_test/utils.ts"
import { SendEmailJob } from "../../../jobs/SendEmailJob.ts"
import { apiRouter } from "../../router.ts"

describe("auth.email.update", () => {
  it('should return "UNAUTHORIZED" when no authorization header is provided', async () => {
    // Arrange - Given
    const input: ApiInputs["auth"]["email"]["update"] = {
      body: { email: "new@example.com" },
      headers: {},
    }
    const context = getTestContext(input.headers)

    // Act - When
    const output = call(apiRouter.auth.email.update, input, { context })

    // Assert - Then
    const expected = new ORPCError("UNAUTHORIZED")
    await assert.rejects(output, expected)
  })

  it("should keep the current email, set the pending one and email both addresses", async () => {
    // Arrange - Given
    const fake = QueueManager.fake()
    const alice = await createAuthTest()
    const newEmail = "alice-new@example.com"
    const input: ApiInputs["auth"]["email"]["update"] = {
      body: { email: newEmail },
      headers: { authorization: alice.authorization },
    }
    const context = getTestContext(input.headers)

    // Act - When
    await call(apiRouter.auth.email.update, input, { context })

    // Assert - Then
    const auth = await call(
      apiRouter.auth.get,
      { headers: { authorization: alice.authorization } },
      { context },
    )
    const output = { email: auth.user.email, emailPending: auth.user.emailPending }
    const expected = { email: alice.email, emailPending: newEmail }
    assert.deepEqual(output, expected)
    fake.assertPushed(SendEmailJob, {
      payload: (payload: EmailInput) => {
        return payload.type === "AuthEmailVerify" && payload.toEmail === newEmail
      },
    })
    fake.assertPushed(SendEmailJob, {
      payload: (payload: EmailInput) => {
        return payload.type === "AuthEmailUpdateWarning" && payload.toEmail === alice.email
      },
    })
    fake.assertPushedCount(2)
  })

  it('should return "CONFLICT" when the email belongs to another user', async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const bob = await createAuthTest()
    const input: ApiInputs["auth"]["email"]["update"] = {
      body: { email: bob.email },
      headers: { authorization: alice.authorization },
    }
    const context = getTestContext(input.headers)

    // Act - When
    const output = call(apiRouter.auth.email.update, input, { context })

    // Assert - Then
    const expected = new ORPCError("CONFLICT", {
      message: "The provided email is already in use.",
    })
    await assert.rejects(output, expected)
  })
})

describe("auth.email.cancelPending", () => {
  it('should return "BAD_REQUEST" when there is no pending email', async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const input: ApiInputs["auth"]["email"]["cancelPending"] = {
      headers: { authorization: alice.authorization },
    }
    const context = getTestContext(input.headers)

    // Act - When
    const output = call(apiRouter.auth.email.cancelPending, input, { context })

    // Assert - Then
    const expected = new ORPCError("BAD_REQUEST", {
      message: "There is no pending email change to cancel.",
    })
    await assert.rejects(output, expected)
  })

  it("should clear the pending email", async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const context = getTestContext({ authorization: alice.authorization })
    await call(
      apiRouter.auth.email.update,
      { body: { email: "alice-new@example.com" }, headers: { authorization: alice.authorization } },
      { context },
    )
    const input: ApiInputs["auth"]["email"]["cancelPending"] = {
      headers: { authorization: alice.authorization },
    }

    // Act - When
    await call(apiRouter.auth.email.cancelPending, input, { context })

    // Assert - Then
    const output = await call(
      apiRouter.auth.get,
      { headers: { authorization: alice.authorization } },
      { context },
    )
    const expected = { email: alice.email, emailPending: null }
    assert.deepEqual({ email: output.user.email, emailPending: output.user.emailPending }, expected)
  })
})

describe("auth.email.verify", () => {
  it("should replace the email with the pending one and redirect", async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const newEmail = "alice-new@example.com"
    await call(
      apiRouter.auth.email.update,
      { body: { email: newEmail }, headers: { authorization: alice.authorization } },
      { context: getTestContext({ authorization: alice.authorization }) },
    )
    const input: ApiInputs["auth"]["email"]["verify"] = {
      query: { token: await getUserTemporaryToken(alice.userId) },
    }
    const context = getTestContext()

    // Act - When
    await call(apiRouter.auth.email.verify, input, { context })

    // Assert - Then
    const auth = await call(
      apiRouter.auth.get,
      { headers: { authorization: alice.authorization } },
      { context: getTestContext({ authorization: alice.authorization }) },
    )
    const output = {
      email: auth.user.email,
      emailPending: auth.user.emailPending,
      hasLocation: context.resHeaders?.has("location"),
    }
    const expected = { email: newEmail, emailPending: null, hasLocation: true }
    assert.deepEqual(output, expected)
  })

  it('should return "BAD_REQUEST" when the token is expired', async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    await call(
      apiRouter.auth.email.update,
      { body: { email: "alice-new@example.com" }, headers: { authorization: alice.authorization } },
      { context: getTestContext({ authorization: alice.authorization }) },
    )
    await expireUserTemporaryToken(alice.userId)
    const input: ApiInputs["auth"]["email"]["verify"] = {
      query: { token: await getUserTemporaryToken(alice.userId) },
    }
    const context = getTestContext()

    // Act - When
    const output = call(apiRouter.auth.email.verify, input, { context })

    // Assert - Then
    const expected = new ORPCError("BAD_REQUEST", {
      message: "The email verification token is expired.",
    })
    await assert.rejects(output, expected)
  })
})
