import { call, ORPCError } from "@orpc/server"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../../_test/utils.ts"
import { createAuthTest, getTestContext } from "../../../_test/utils.ts"
import { apiRouter } from "../../router.ts"

describe("auth.get", () => {
  it('should return "UNAUTHORIZED" when no authorization header is provided', async () => {
    // Arrange - Given
    const input: ApiInputs["auth"]["get"] = { headers: {} }
    const context = getTestContext(input.headers)

    // Act - When
    const output = call(apiRouter.auth.get, input, { context })

    // Assert - Then
    const expected = new ORPCError("UNAUTHORIZED")
    await assert.rejects(output, expected)
  })

  it("should return the authenticated user, never another one", async () => {
    // Arrange - Given
    const alice = await createAuthTest({ displayName: "Alice" })
    await createAuthTest({ displayName: "Bob" })
    const input: ApiInputs["auth"]["get"] = { headers: { authorization: alice.authorization } }
    const context = getTestContext(input.headers)

    // Act - When
    const output = await call(apiRouter.auth.get, input, { context })

    // Assert - Then
    const expected = { id: alice.userId, displayName: "Alice", email: alice.email }
    assert.deepEqual(
      { id: output.user.id, displayName: output.user.displayName, email: output.user.email },
      expected,
    )
  })
})
