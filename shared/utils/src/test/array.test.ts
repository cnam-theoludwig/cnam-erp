import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import { chunk, deduplicate, getHasCommonValue } from "../array.ts"

describe("array", () => {
  describe("chunk", () => {
    it("should split the items into consecutive chunks of the given size", () => {
      // Arrange - Given
      const input = [1, 2, 3, 4, 5]

      // Act - When
      const output = chunk(input, 2)

      // Assert - Then
      const expected = [[1, 2], [3, 4], [5]]
      assert.deepStrictEqual(output, expected)
    })

    it("should return a single chunk when the size exceeds the item count", () => {
      // Arrange - Given
      const input = [1, 2, 3]

      // Act - When
      const output = chunk(input, 10)

      // Assert - Then
      const expected = [[1, 2, 3]]
      assert.deepStrictEqual(output, expected)
    })

    it("should return no chunk for an empty array", () => {
      // Arrange - Given
      const input: number[] = []

      // Act - When
      const output = chunk(input, 3)

      // Assert - Then
      const expected: number[][] = []
      assert.deepStrictEqual(output, expected)
    })

    it("should throw when the size is not positive", () => {
      // Arrange - Given
      const input = [1, 2, 3]

      // Act - When
      const output = (): number[][] => {
        return chunk(input, 0)
      }

      // Assert - Then
      const expected = RangeError
      assert.throws(output, expected)
    })
  })

  describe("deduplicate", () => {
    it("should remove repeated values and keep the order of their first occurrence", () => {
      // Arrange - Given
      const input = ["rust", "ark-ascended", "rust", "ark-evolved", "ark-ascended"]

      // Act - When
      const output = deduplicate(input)

      // Assert - Then
      const expected = ["rust", "ark-ascended", "ark-evolved"]
      assert.deepStrictEqual(output, expected)
    })

    it("should return an empty array for an empty input", () => {
      // Arrange - Given
      const input: string[] = []

      // Act - When
      const output = deduplicate(input)

      // Assert - Then
      const expected: string[] = []
      assert.deepStrictEqual(output, expected)
    })
  })

  describe("getHasCommonValue", () => {
    it("should return true when at least one value is in both arrays", () => {
      // Arrange - Given
      const input = { valuesA: ["rust", "ark-evolved"], valuesB: ["ark-ascended", "ark-evolved"] }

      // Act - When
      const output = getHasCommonValue(input.valuesA, input.valuesB)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return false when no value is in both arrays", () => {
      // Arrange - Given
      const input = { valuesA: ["rust"], valuesB: ["ark-ascended", "ark-evolved"] }

      // Act - When
      const output = getHasCommonValue(input.valuesA, input.valuesB)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when one of the arrays is empty", () => {
      // Arrange - Given
      const valuesA: string[] = []
      const input = { valuesA, valuesB: ["ark-ascended"] }

      // Act - When
      const output = getHasCommonValue(input.valuesA, input.valuesB)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })
  })
})
