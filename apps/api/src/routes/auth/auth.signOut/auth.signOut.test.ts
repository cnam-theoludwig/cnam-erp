import { call, ORPCError } from "@orpc/server"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../../_test/utils.ts"
import { createAuthTest, getTestContext, signInClassicTest } from "../../../_test/utils.ts"
import { apiRouter } from "../../router.ts"

describe("auth.signOut.bySessionId", () => {
  it("should revoke the session so its authorization no longer authenticates", async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const context = getTestContext({ authorization: alice.authorization })
    const auth = await call(
      apiRouter.auth.get,
      { headers: { authorization: alice.authorization } },
      { context },
    )
    const input: ApiInputs["auth"]["signOut"]["bySessionId"] = {
      params: { sessionId: auth.authJWT.sessionId },
      headers: { authorization: alice.authorization },
    }

    // Act - When
    await call(apiRouter.auth.signOut.bySessionId, input, { context })

    // Assert - Then
    const output = call(
      apiRouter.auth.get,
      { headers: { authorization: alice.authorization } },
      { context },
    )
    const expected = new ORPCError("UNAUTHORIZED")
    await assert.rejects(output, expected)
  })

  it("should never revoke a session of another user", async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const bob = await createAuthTest()
    const bobContext = getTestContext({ authorization: bob.authorization })
    const bobAuth = await call(
      apiRouter.auth.get,
      { headers: { authorization: bob.authorization } },
      { context: bobContext },
    )
    const input: ApiInputs["auth"]["signOut"]["bySessionId"] = {
      params: { sessionId: bobAuth.authJWT.sessionId },
      headers: { authorization: alice.authorization },
    }

    // Act - When
    await call(apiRouter.auth.signOut.bySessionId, input, {
      context: getTestContext(input.headers),
    })

    // Assert - Then
    const output = await call(
      apiRouter.auth.get,
      { headers: { authorization: bob.authorization } },
      { context: bobContext },
    )
    const expected = bob.userId
    assert.strictEqual(output.user.id, expected)
  })
})

describe("auth.signOut.allSessions", () => {
  it("should revoke every session of the authenticated user", async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const aliceOtherSession = await signInClassicTest(alice)
    const input: ApiInputs["auth"]["signOut"]["allSessions"] = {
      headers: { authorization: alice.authorization },
    }

    // Act - When
    await call(apiRouter.auth.signOut.allSessions, input, {
      context: getTestContext(input.headers),
    })

    // Assert - Then
    const output = call(
      apiRouter.auth.get,
      { headers: { authorization: aliceOtherSession.authorization } },
      { context: getTestContext({ authorization: aliceOtherSession.authorization }) },
    )
    const expected = new ORPCError("UNAUTHORIZED")
    await assert.rejects(output, expected)
  })
})
