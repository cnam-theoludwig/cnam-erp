import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import {
  CallbackZodBasic,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PasswordZod,
  USER_DISPLAY_NAME_MAX_LENGTH,
  USER_DISPLAY_NAME_MIN_LENGTH,
  UserAccountZodObject,
  UserZod,
} from "../AuthUser.ts"

describe("AuthUser", () => {
  describe("CallbackZodBasic", () => {
    it("should accept a valid callback path", () => {
      // Arrange - Given
      const input = "/user/settings"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should accept a root path", () => {
      // Arrange - Given
      const input = "/"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path that does not start with /", () => {
      // Arrange - Given
      const input = "user/settings"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path containing //", () => {
      // Arrange - Given
      const input = "/user//settings"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path containing /../", () => {
      // Arrange - Given
      const input = "/user/../settings"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path ending with /..", () => {
      // Arrange - Given
      const input = "/user/.."

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject an empty string", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path that throws when parsed by URL constructor", () => {
      // Arrange - Given
      const input = "/\\"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path containing a backslash (open redirect via WHATWG normalization)", () => {
      // Arrange - Given
      const input = "/\\evil.com"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path containing percent-encoded slash", () => {
      // Arrange - Given
      const input = "/%2fevil.com"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path containing percent-encoded backslash", () => {
      // Arrange - Given
      const input = "/%5cevil.com"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a path containing CR/LF", () => {
      // Arrange - Given
      const input = "/path\r\nSet-Cookie: x=y"

      // Act - When
      const output = CallbackZodBasic.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })
  })

  describe("UserZod.displayName", () => {
    it("should capitalize the display name", () => {
      // Arrange - Given
      const input = "john doe"

      // Act - When
      const output = UserZod.displayName.parse(input)

      // Assert - Then
      const expected = "John doe"
      assert.strictEqual(output, expected)
    })

    it("should reject a display name shorter than the minimum length", () => {
      // Arrange - Given
      const input = "a".repeat(Math.max(0, USER_DISPLAY_NAME_MIN_LENGTH - 1))

      // Act - When
      const output = UserZod.displayName.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should reject a display name longer than the maximum length", () => {
      // Arrange - Given
      const input = "a".repeat(USER_DISPLAY_NAME_MAX_LENGTH + 1)

      // Act - When
      const output = UserZod.displayName.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })
  })

  describe("UserZod.email", () => {
    it("should transform an empty string to null", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = UserZod.email.parse(input)

      // Assert - Then
      const expected = null
      assert.strictEqual(output, expected)
    })
  })

  describe("UserZod.emailPending", () => {
    it("should transform an empty string to null", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = UserZod.emailPending.parse(input)

      // Assert - Then
      const expected = null
      assert.strictEqual(output, expected)
    })
  })

  describe("PasswordZod", () => {
    it("should reject a password shorter than the minimum length", () => {
      // Arrange - Given
      const input = "x".repeat(Math.max(0, PASSWORD_MIN_LENGTH - 1))

      // Act - When
      const output = PasswordZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })

    it("should accept a password at the minimum length", () => {
      // Arrange - Given
      const input = "x".repeat(PASSWORD_MIN_LENGTH)

      // Act - When
      const output = PasswordZod.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should accept a password at the maximum length", () => {
      // Arrange - Given
      const input = "x".repeat(PASSWORD_MAX_LENGTH)

      // Act - When
      const output = PasswordZod.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should reject a password longer than the maximum length", () => {
      // Arrange - Given
      const input = "x".repeat(PASSWORD_MAX_LENGTH + 1)

      // Act - When
      const output = PasswordZod.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })
  })

  describe("UserAccountZodObject", () => {
    it("should accept a valid user account", () => {
      // Arrange - Given
      const input = {
        id: "019b6468-8e98-7180-ac0f-2e8b9ac20722",
        userId: "019b6468-8e98-7180-ac0f-2e8b9ac20723",
        provider: "classic",
        providerAccountId: "019b6468-8e98-7180-ac0f-2e8b9ac20723",
        information: "$argon2id$v=19$m=65536,t=3,p=4$salt$hash",
      }

      // Act - When
      const output = UserAccountZodObject.safeParse(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output.success, expected)
    })

    it("should reject when providerAccountId is empty", () => {
      // Arrange - Given
      const input = {
        id: "019b6468-8e98-7180-ac0f-2e8b9ac20722",
        userId: "019b6468-8e98-7180-ac0f-2e8b9ac20723",
        provider: "classic",
        providerAccountId: "",
        information: "$argon2id$v=19$m=65536,t=3,p=4$salt$hash",
      }

      // Act - When
      const output = UserAccountZodObject.safeParse(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output.success, expected)
    })
  })
})
