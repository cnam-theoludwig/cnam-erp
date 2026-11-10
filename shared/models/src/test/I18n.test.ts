import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import {
  CURRENCY_DEFAULT,
  I18N_LOCALES,
  TimezoneZod,
  getTimezoneLabel,
  hasI18nLocale,
  hasTimezone,
  priceConverter,
} from "../I18n.ts"

describe("I18n", () => {
  describe("hasI18nLocale", () => {
    it("should return true for all defined locales", () => {
      // Arrange - Given
      const inputs = I18N_LOCALES

      // Act - When
      const outputs = inputs.map((input) => {
        return hasI18nLocale(input)
      })

      // Assert - Then
      const expected = inputs.map(() => {
        return true
      })
      assert.deepStrictEqual(outputs, expected)
    })

    it("should return false for an invalid locale", () => {
      // Arrange - Given
      const input = "xx-XX"

      // Act - When
      const output = hasI18nLocale(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false for an empty string", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = hasI18nLocale(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })
  })

  describe("hasTimezone", () => {
    it("should return true for a known IANA timezone", () => {
      // Arrange - Given
      const input = "Europe/Paris"

      // Act - When
      const output = hasTimezone(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return false for an unknown timezone", () => {
      // Arrange - Given
      const input = "Mars/Olympus"

      // Act - When
      const output = hasTimezone(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return true for a renamed timezone still reported by browsers under its legacy name", () => {
      // Arrange - Given
      const input = ["Asia/Saigon", "America/Buenos_Aires", "America/Indianapolis"]

      // Act - When
      const output = input.map((timezone) => {
        return hasTimezone(timezone)
      })

      // Assert - Then
      const expected = [true, true, true]
      assert.deepEqual(output, expected)
    })

    it("should return false for a timezone with non-canonical casing", () => {
      // Arrange - Given
      const input = "europe/paris"

      // Act - When
      const output = hasTimezone(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })
  })

  describe("TimezoneZod", () => {
    it("should accept a valid timezone", () => {
      // Arrange - Given
      const input = "Europe/Paris"

      // Act - When
      const output = TimezoneZod.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should reject an invalid timezone", () => {
      // Arrange - Given
      const input = "Mars/Olympus"

      // Act - When
      const output = TimezoneZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })
  })

  describe("getTimezoneLabel", () => {
    it("should replace underscores with spaces", () => {
      // Arrange - Given
      const input = "America/New_York"

      // Act - When
      const output = getTimezoneLabel(input)

      // Assert - Then
      const expected = "America/New York"
      assert.strictEqual(output, expected)
    })
  })

  describe("priceConverter", () => {
    it("should convert cents to major unit correctly", () => {
      // Arrange - Given
      const cents = 115_00

      // Act - When
      const output = priceConverter.centsToMajorUnit(cents, CURRENCY_DEFAULT)

      // Assert - Then
      const expected = 115
      assert.strictEqual(output, expected)
    })

    it("should convert major unit to cents correctly", () => {
      // Arrange - Given
      const majorUnit = 115

      // Act - When
      const output = priceConverter.majorUnitToCents(majorUnit, CURRENCY_DEFAULT)

      // Assert - Then
      const expected = 115_00
      assert.strictEqual(output, expected)
    })

    it("should handle floating point precision when converting major unit to cents", () => {
      // Arrange - Given
      const majorUnit = 1.15

      // Act - When
      const output = priceConverter.majorUnitToCents(majorUnit, CURRENCY_DEFAULT)

      // Assert - Then
      const expected = 115
      assert.strictEqual(output, expected)
    })

    it("should handle floating point precision when converting cents to major unit", () => {
      // Arrange - Given
      const cents = 115

      // Act - When
      const output = priceConverter.centsToMajorUnit(cents, CURRENCY_DEFAULT)

      // Assert - Then
      const expected = 1.15
      assert.strictEqual(output, expected)
    })
  })
})
