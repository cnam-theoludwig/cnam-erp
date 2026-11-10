import { call, ORPCError } from "@orpc/server"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../../_test/utils.ts"
import { createAuthTest, getTestContext } from "../../../_test/utils.ts"
import { apiRouter } from "../../router.ts"

describe("auth.updateI18nLocale", () => {
  it('should return "UNAUTHORIZED" when no authorization header is provided', async () => {
    // Arrange - Given
    const input: ApiInputs["auth"]["updateI18nLocale"] = {
      body: { i18nLocale: "en-GB" },
      headers: {},
    }
    const context = getTestContext(input.headers)

    // Act - When
    const output = call(apiRouter.auth.updateI18nLocale, input, { context })

    // Assert - Then
    const expected = new ORPCError("UNAUTHORIZED")
    await assert.rejects(output, expected)
  })

  it("should persist the i18n locale of the authenticated user", async () => {
    // Arrange - Given
    const alice = await createAuthTest()
    const input: ApiInputs["auth"]["updateI18nLocale"] = {
      body: { i18nLocale: "en-GB" },
      headers: { authorization: alice.authorization },
    }
    const context = getTestContext(input.headers)

    // Act - When
    await call(apiRouter.auth.updateI18nLocale, input, { context })

    // Assert - Then
    const output = await call(
      apiRouter.auth.get,
      { headers: { authorization: alice.authorization } },
      { context },
    )
    const expected = "en-GB"
    assert.strictEqual(output.user.i18nLocale, expected)
  })
})
