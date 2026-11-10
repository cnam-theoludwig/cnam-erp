import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import {
  calculateAverage,
  calculateRatio,
  calculateSum,
  clamp,
  parseNumberInput,
  percentToRatio,
  ratioToPercent,
  sortCompare,
} from "../math.ts"

describe("math", () => {
  describe("calculateRatio", () => {
    it("should calculate the ratio of a value to a total", () => {
      // Arrange - Given
      const value = 3
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0.3
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the total is 0", () => {
      // Arrange - Given
      const value = 3
      const total = 0

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the total is negative", () => {
      // Arrange - Given
      const value = 3
      const total = -1

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the value is 0", () => {
      // Arrange - Given
      const value = 0
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 1 if the value is equal to the total", () => {
      // Arrange - Given
      const value = 10
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should return 1 and more if the value is greater than the total", () => {
      // Arrange - Given
      const value = 11
      const total = 10

      // Act - When
      const output = calculateRatio(value, total)

      // Assert - Then
      const expected = 1.1
      assert.strictEqual(output, expected)
    })
  })

  describe("ratioToPercent", () => {
    it("should convert a ratio to its whole-percent value", () => {
      // Arrange - Given
      const ratio = 0.9

      // Act - When
      const output = ratioToPercent(ratio)

      // Assert - Then
      const expected = 90
      assert.strictEqual(output, expected)
    })

    it("should convert the lowest ratio bound", () => {
      // Arrange - Given
      const ratio = 0.01

      // Act - When
      const output = ratioToPercent(ratio)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should convert a ratio of 0 to 0 percent", () => {
      // Arrange - Given
      const ratio = 0

      // Act - When
      const output = ratioToPercent(ratio)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })

  describe("percentToRatio", () => {
    it("should convert a whole-percent value to its ratio", () => {
      // Arrange - Given
      const percent = 90

      // Act - When
      const output = percentToRatio(percent)

      // Assert - Then
      const expected = 0.9
      assert.strictEqual(output, expected)
    })

    it("should convert 100 percent to a ratio of 1", () => {
      // Arrange - Given
      const percent = 100

      // Act - When
      const output = percentToRatio(percent)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should convert 0 percent to a ratio of 0", () => {
      // Arrange - Given
      const percent = 0

      // Act - When
      const output = percentToRatio(percent)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should round-trip a percent back to itself", () => {
      // Arrange - Given
      const percent = 37

      // Act - When
      const output = ratioToPercent(percentToRatio(percent))

      // Assert - Then
      const expected = 37
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateSum", () => {
    it("should calculate the sum of an array of numbers", () => {
      // Arrange - Given
      const numbers = [1, 2, 3]

      // Act - When
      const output = calculateSum(numbers)

      // Assert - Then
      const expected = 6
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the array is empty", () => {
      // Arrange - Given
      const numbers: number[] = []

      // Act - When
      const output = calculateSum(numbers)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateAverage", () => {
    it("should calculate the average of an array of numbers", () => {
      // Arrange - Given
      const numbers = [1, 2, 3]

      // Act - When
      const output = calculateAverage(numbers)

      // Assert - Then
      const expected = 2
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the array is empty", () => {
      // Arrange - Given
      const numbers: number[] = []

      // Act - When
      const output = calculateAverage(numbers)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })

  describe("sortCompare", () => {
    it("should return 0 if both values are equal", () => {
      // Arrange - Given
      const a = 1
      const b = 1

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if both string values are equal", () => {
      // Arrange - Given
      const a = "abc"
      const b = "abc"

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the first value is null and the second is a number", () => {
      // Arrange - Given
      const a: number | null = null
      const b = 5

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if the first value is a number and the second is null", () => {
      // Arrange - Given
      const a = 5
      const b: number | null = null

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 1 if the first value is greater than the second", () => {
      // Arrange - Given
      const a = 2
      const b = 1

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should return -1 if the first value is less than the second", () => {
      // Arrange - Given
      const a = 1
      const b = 2

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = -1
      assert.strictEqual(output, expected)
    })

    it("should return 0 if both values are null", () => {
      // Arrange - Given
      const a: number | null = null
      const b: number | null = null

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return 0 if one value is null and the other is undefined", () => {
      // Arrange - Given
      const a: number | null = null
      const b: number | undefined = undefined

      // Act - When
      const output = sortCompare(a, b)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })
  describe("clamp", () => {
    it("should keep a value inside the range unchanged", () => {
      // Arrange - Given
      const input = { value: 5, minimum: 0, maximum: 10 }

      // Act - When
      const output = clamp(input)

      // Assert - Then
      const expected = 5
      assert.strictEqual(output, expected)
    })

    it("should raise a value below the minimum to the minimum", () => {
      // Arrange - Given
      const input = { value: -3, minimum: 0, maximum: 10 }

      // Act - When
      const output = clamp(input)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should lower a value above the maximum to the maximum", () => {
      // Arrange - Given
      const input = { value: 15, minimum: 0, maximum: 10 }

      // Act - When
      const output = clamp(input)

      // Assert - Then
      const expected = 10
      assert.strictEqual(output, expected)
    })
  })

  describe("parseNumberInput", () => {
    it("should return null for an empty value", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = parseNumberInput(input)

      // Assert - Then
      const expected = null
      assert.strictEqual(output, expected)
    })

    it("should return null for a value that is not a number", () => {
      // Arrange - Given
      const input = "abc"

      // Act - When
      const output = parseNumberInput(input)

      // Assert - Then
      const expected = null
      assert.strictEqual(output, expected)
    })

    it("should parse a decimal value", () => {
      // Arrange - Given
      const input = "12.5"

      // Act - When
      const output = parseNumberInput(input)

      // Assert - Then
      const expected = 12.5
      assert.strictEqual(output, expected)
    })
  })
})
