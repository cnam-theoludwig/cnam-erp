import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import { EMAIL_MAX_LENGTH, EmailZod, WEB_URL_MAX_LENGTH, WebURLZod } from "../Entity.ts"

describe("Entity", () => {
  describe("EmailZod", () => {
    it("should lowercase the email", () => {
      // Arrange - Given
      const input = "USER@Example.COM"

      // Act - When
      const output = EmailZod.parse(input)

      // Assert - Then
      const expected = "user@example.com"
      assert.strictEqual(output, expected)
    })

    it("should reject an email longer than the maximum length", () => {
      // Arrange - Given
      const domain = "@example.com"
      const localPart = "a".repeat(Math.max(0, EMAIL_MAX_LENGTH - domain.length + 1))
      const input = `${localPart}${domain}`

      // Act - When
      const output = EmailZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a value that is not a valid email", () => {
      // Arrange - Given
      const input = "not-an-email"

      // Act - When
      const output = EmailZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })
  })

  describe("WebURLZod", () => {
    it("should accept an https URL", () => {
      // Arrange - Given
      const input = "https://example.com"

      // Act - When
      const output = WebURLZod.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should accept an http URL", () => {
      // Arrange - Given
      const input = "http://example.com"

      // Act - When
      const output = WebURLZod.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should lowercase the protocol and hostname while keeping the path case", () => {
      // Arrange - Given
      const input = " HtTpS://Discord.GG/HqQnfmJS4w "

      // Act - When
      const output = WebURLZod.parse(input)

      // Assert - Then
      const expected = "https://discord.gg/HqQnfmJS4w"
      assert.strictEqual(output, expected)
    })

    it("should not add a trailing slash to a bare origin", () => {
      // Arrange - Given
      const input = "HTTPS://NOBSARK.COM"

      // Act - When
      const output = WebURLZod.parse(input)

      // Assert - Then
      const expected = "https://nobsark.com"
      assert.strictEqual(output, expected)
    })

    it("should keep a typed trailing slash", () => {
      // Arrange - Given
      const input = "https://arklight.gg/"

      // Act - When
      const output = WebURLZod.parse(input)

      // Assert - Then
      const expected = "https://arklight.gg/"
      assert.strictEqual(output, expected)
    })

    it("should reject an ftp URL", () => {
      // Arrange - Given
      const input = "ftp://example.com"

      // Act - When
      const output = WebURLZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a non-URL string", () => {
      // Arrange - Given
      const input = "not-a-url"

      // Act - When
      const output = WebURLZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should accept a URL at the maximum length", () => {
      // Arrange - Given
      const prefix = "https://example.com/"
      const input = prefix + "a".repeat(Math.max(0, WEB_URL_MAX_LENGTH - prefix.length))

      // Act - When
      const output = WebURLZod.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should reject a URL longer than the maximum length", () => {
      // Arrange - Given
      const prefix = "https://example.com/"
      const input = prefix + "a".repeat(Math.max(0, WEB_URL_MAX_LENGTH - prefix.length + 1))

      // Act - When
      const output = WebURLZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })
  })
})
