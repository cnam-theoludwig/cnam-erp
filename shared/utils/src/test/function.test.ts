import assert from "node:assert/strict"
import { beforeEach, describe, it, mock, spyOn } from "bun:test"
import { assertUnreachable, handleJob, noop } from "../function.ts"

describe("function", () => {
  describe("noop", () => {
    it("should return undefined and not throw", () => {
      // Act - When
      const output = noop()

      // Assert - Then
      const expected = undefined
      assert.strictEqual(output, expected)
    })
  })

  describe("assertUnreachable", () => {
    it("should throw with the unexpected value", () => {
      // Arrange - Given
      const input = "unexpected" as never

      // Act - When
      const output = (): never => {
        return assertUnreachable(input)
      }

      // Assert - Then
      const expected = new Error("Unreachable value: unexpected")
      assert.throws(output, expected)
    })
  })

  describe("handleJob", () => {
    beforeEach(() => {
      mock.restore()
    })

    it("should return the result on success", async () => {
      // Arrange - Given
      spyOn(console, "log").mockImplementation(() => {})
      const input = {
        name: "test-job",
        handler: async () => {
          return { result: 42 }
        },
      }

      // Act - When
      const output = await handleJob(input)

      // Assert - Then
      const expected = { result: 42 }
      assert.deepStrictEqual(output, expected)
    })

    it("should return undefined when the handler has no result", async () => {
      // Arrange - Given
      spyOn(console, "log").mockImplementation(() => {})
      const input = {
        name: "test-job",
        handler: async () => {},
      }

      // Act - When
      const output = await handleJob(input)

      // Assert - Then
      const expected = { result: undefined }
      assert.deepStrictEqual(output, expected)
    })

    it("should return undefined when the handler throws an error", async () => {
      // Arrange - Given
      spyOn(console, "log").mockImplementation(() => {})
      spyOn(console, "error").mockImplementation(() => {})
      const input = {
        name: "test-job",
        handler: async () => {
          throw new Error("test error")
        },
      }

      // Act - When
      const output = await handleJob(input)

      // Assert - Then
      const expected = undefined
      assert.strictEqual(output.result, expected)
      assert.ok(output.error instanceof Error)
      assert.strictEqual(output.error.message, "test error")
    })

    it("should log additional information when provided", async () => {
      // Arrange - Given
      const logMessages: string[] = []
      spyOn(console, "log").mockImplementation((...args: unknown[]) => {
        const message = args[0]
        if (typeof message === "string") {
          logMessages.push(message)
        }
      })
      const input = {
        name: "test-job",
        handler: async () => {
          return { additionalInformation: "processed 5 items" }
        },
      }

      // Act - When
      await handleJob(input)

      // Assert - Then
      const doneMessage = logMessages.find((message) => {
        return message.includes("done in")
      })
      assert.ok(doneMessage != null)
      assert.ok(doneMessage.includes("(processed 5 items)"))
    })

    it("should log a start message containing the job name and ellipsis", async () => {
      // Arrange - Given
      const logMessages: string[] = []
      spyOn(console, "log").mockImplementation((...args: unknown[]) => {
        const message = args[0]
        if (typeof message === "string") {
          logMessages.push(message)
        }
      })
      const input = {
        name: "unique-start-name",
        handler: async () => {},
      }

      // Act - When
      await handleJob(input)

      // Assert - Then
      const startMessage = logMessages.find((message) => {
        return message.includes("unique-start-name...")
      })
      assert.ok(startMessage != null)
    })

    it("should log a done message without parentheses when no additional information is provided", async () => {
      // Arrange - Given
      const logMessages: string[] = []
      spyOn(console, "log").mockImplementation((...args: unknown[]) => {
        const message = args[0]
        if (typeof message === "string") {
          logMessages.push(message)
        }
      })
      const input = {
        name: "test-job",
        handler: async () => {
          return { result: 1 }
        },
      }

      // Act - When
      await handleJob(input)

      // Assert - Then
      const doneMessage = logMessages.find((message) => {
        return message.includes("done in")
      })
      assert.ok(doneMessage != null)
      assert.ok(!doneMessage.includes("Stryker"))
      assert.ok(/done in [^(]*$/u.test(doneMessage))
    })

    it("should log elapsed time as the difference between end and start, not their sum", async () => {
      // Arrange - Given
      const logMessages: string[] = []
      spyOn(console, "log").mockImplementation((...args: unknown[]) => {
        const message = args[0]
        if (typeof message === "string") {
          logMessages.push(message)
        }
      })
      let nowCallCount = 0
      spyOn(performance, "now").mockImplementation(() => {
        nowCallCount += 1
        return nowCallCount === 1 ? 1_000_000 : 1_000_500
      })
      const input = {
        name: "elapsed-job",
        handler: async () => {},
      }

      // Act - When
      await handleJob(input)

      // Assert - Then
      const doneMessage = logMessages.find((message) => {
        return message.includes("done in")
      })
      assert.ok(doneMessage != null)
      assert.ok(doneMessage.includes("done in 500ms"))
    })

    it("should log an error message containing the job name and 'Error:' on failure", async () => {
      // Arrange - Given
      spyOn(console, "log").mockImplementation(() => {})
      const errorMessages: string[] = []
      spyOn(console, "error").mockImplementation((...args: unknown[]) => {
        const message = args[0]
        if (typeof message === "string") {
          errorMessages.push(message)
        }
      })
      const input = {
        name: "unique-error-name",
        handler: async () => {
          throw new Error("boom")
        },
      }

      // Act - When
      await handleJob(input)

      // Assert - Then
      const errorMessage = errorMessages.find((message) => {
        return message.includes("unique-error-name Error:")
      })
      assert.ok(errorMessage != null)
    })
  })
})
