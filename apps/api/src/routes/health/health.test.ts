import { call } from "@orpc/server"
import { API_KEY, API_KEY_HEADER_NAME } from "@repo/utils/configuration"
import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { ApiInputs } from "../../_test/utils.ts"
import { getTestContext } from "../../_test/utils.ts"
import { apiRouter } from "../router.ts"

describe("health", () => {
  it("should return healthy status without detailed checks when no API key is provided", async () => {
    // Arrange - Given
    const input: ApiInputs["health"] = {
      headers: {},
    }
    const context = getTestContext(input.headers)

    // Act - When
    const output = await call(apiRouter.health, input, { context })

    // Assert - Then
    const expected = { isHealthy: true, checks: undefined }
    assert.strictEqual(output.data.isHealthy, expected.isHealthy)
    assert.strictEqual(output.data.checks, expected.checks)
  })

  it("should return healthy status with detailed checks when valid API key is provided", async () => {
    // Arrange - Given
    const input: ApiInputs["health"] = {
      headers: { [API_KEY_HEADER_NAME]: API_KEY },
    }
    const context = getTestContext(input.headers)

    // Act - When
    const output = await call(apiRouter.health, input, { context })

    // Assert - Then
    const expected = {
      isHealthy: true,
      checkNames: [
        "Memory heap check",
        "Memory RSS check",
        "Disk space check",
        "Database health check",
        "Redis health check",
      ],
    }
    const outputSummary = {
      isHealthy: output.data.isHealthy,
      checkNames: output.data.checks?.map((check) => {
        return (check as { name: string }).name
      }),
    }
    assert.deepEqual(outputSummary, expected)
  })

  it("should not include detailed checks when an invalid API key is provided", async () => {
    // Arrange - Given
    const input: ApiInputs["health"] = {
      headers: { [API_KEY_HEADER_NAME]: "invalid-api-key" },
    }
    const context = getTestContext(input.headers)

    // Act - When
    const output = await call(apiRouter.health, input, { context })

    // Assert - Then
    const expected = { isHealthy: true, checks: undefined }
    assert.strictEqual(output.data.isHealthy, expected.isHealthy)
    assert.strictEqual(output.data.checks, expected.checks)
  })
})
