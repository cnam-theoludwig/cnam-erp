import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import { API_KEY } from "../configuration.ts"
import {
  getIsApiKeyValid,
  hashSha256Hex,
  passwordHash,
  passwordNeedsRehash,
  passwordVerify,
} from "../crypto.ts"

const TEST_PASSWORD = "correct horse battery staple"

describe("crypto", () => {
  describe("passwordHash and passwordVerify", () => {
    it("should produce a PHC-formatted Argon2id string with configured parameters", async () => {
      // Arrange - Given
      const password = TEST_PASSWORD

      // Act - When
      const output = await passwordHash(password)

      // Assert - Then
      const expected = /^\$argon2id\$v=19\$m=65536,t=3,p=4\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$/u
      assert.match(output, expected)
    })

    it("should verify a correct password", async () => {
      // Arrange - Given
      const hash = await passwordHash(TEST_PASSWORD)

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hash)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should reject an incorrect password", async () => {
      // Arrange - Given
      const hash = await passwordHash(TEST_PASSWORD)
      const incorrectPassword = "wrong-password"

      // Act - When
      const output = await passwordVerify(incorrectPassword, hash)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should produce different hashes for the same password due to random salt", async () => {
      // Arrange - Given
      const password = TEST_PASSWORD

      // Act - When
      const hash1 = await passwordHash(password)
      const hash2 = await passwordHash(password)
      const output1 = await passwordVerify(password, hash1)
      const output2 = await passwordVerify(password, hash2)

      // Assert - Then
      assert.notStrictEqual(hash1, hash2)
      assert.strictEqual(output1, true)
      assert.strictEqual(output2, true)
    })

    it("should handle Unicode passwords", async () => {
      // Arrange - Given
      const password = "пароль-密码-كلمة-السر-🔑"
      const hash = await passwordHash(password)

      // Act - When
      const outputCorrect = await passwordVerify(password, hash)
      const outputIncorrect = await passwordVerify("other", hash)

      // Assert - Then
      const expected = {
        outputCorrect: true,
        outputIncorrect: false,
      }
      assert.strictEqual(outputCorrect, expected.outputCorrect)
      assert.strictEqual(outputIncorrect, expected.outputIncorrect)
    })

    it("should handle empty password", async () => {
      // Arrange - Given
      const password = ""
      const hash = await passwordHash(password)

      // Act - When
      const outputCorrect = await passwordVerify("", hash)
      const outputIncorrect = await passwordVerify("nonempty", hash)

      // Assert - Then
      const expected = {
        outputCorrect: true,
        outputIncorrect: false,
      }
      assert.strictEqual(outputCorrect, expected.outputCorrect)
      assert.strictEqual(outputIncorrect, expected.outputIncorrect)
    })

    it("should reject a valid signature whose memory exceeds the configured upper bound", async () => {
      // Arrange - Given
      const hashWithExcessiveMemory =
        "$argon2id$v=19$m=131072,t=3,p=4$lq1CIfpH9eFFEyxCYfkDWQ$DhZs6AHxjP+Di/pQZZmkwVZinzOkxz7sBkSG1MQum1o"

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithExcessiveMemory)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should reject a valid signature whose passes exceeds the configured upper bound", async () => {
      // Arrange - Given
      const hashWithExcessivePasses =
        "$argon2id$v=19$m=65536,t=4,p=4$ha/xw4VVdhgU77ppnLV8Bw$DRNWbIhHPpEFSL7QxI1iz1vMUba2e/vssMqX5A7BtHU"

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithExcessivePasses)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should reject a valid signature whose parallelism exceeds the configured upper bound", async () => {
      // Arrange - Given
      const hashWithExcessiveParallelism =
        "$argon2id$v=19$m=65536,t=3,p=5$z1zb/XgIvuY3rG/QqhHBTQ$gyOowRh8nGFvrDRX4CJRoKIv7I8vH2GE0MD+6fI/F0Y"

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithExcessiveParallelism)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should reject hash with parameters exceeding configured bounds", async () => {
      // Arrange - Given
      const baseHash = await passwordHash(TEST_PASSWORD)
      const outOfBoundHashes = [
        baseHash.replace("m=65536", "m=2147483648"),
        baseHash.replace("t=3", "t=1000"),
        baseHash.replace("p=4", "p=1000"),
        baseHash.replace("m=65536", "m=0"),
        baseHash.replace("t=3", "t=0"),
        baseHash.replace("p=4", "p=0"),
        baseHash.replace("m=65536", "m=abc"),
        baseHash.replace("m=65536", "m=1.5"),
      ]

      // Assert - Then
      const expected = false
      await Promise.all(
        outOfBoundHashes.map(async (hash) => {
          const output = await passwordVerify(TEST_PASSWORD, hash)
          assert.strictEqual(output, expected, `expected false for ${JSON.stringify(hash)}`)
        }),
      )
    })

    it("should return false on malformed hash strings", async () => {
      // Arrange - Given
      const malformedHashes = [
        "",
        "not-a-phc-string",
        "$argon2id$v=19$m=65536,t=3,p=4$onlyfivefields",
        "$argon2i$v=19$m=65536,t=3,p=4$c2FsdA$dGFn",
        "$argon2id$v=18$m=65536,t=3,p=4$c2FsdA$dGFn",
        "$argon2id$v=19$m=65536,t=3$c2FsdA$dGFn",
      ]

      // Assert - Then
      const expected = false
      await Promise.all(
        malformedHashes.map(async (hash) => {
          const output = await passwordVerify(TEST_PASSWORD, hash)
          assert.strictEqual(output, expected, `expected false for ${JSON.stringify(hash)}`)
        }),
      )
    })

    it("should reject a valid hash with an extra appended segment", async () => {
      // Arrange - Given
      const validHash = await passwordHash(TEST_PASSWORD)
      const hashWithExtraSegment = `${validHash}$extra`

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithExtraSegment)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should reject a valid hash with a segment removed", async () => {
      // Arrange - Given
      const validHash = await passwordHash(TEST_PASSWORD)
      const truncatedHash = validHash.split("$").slice(0, -1).join("$")

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, truncatedHash)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when argon2 throws on invalid salt", async () => {
      // Arrange - Given
      const hashWithEmptySalt = "$argon2id$v=19$m=65536,t=3,p=4$$dGFn"

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithEmptySalt)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when argon2 throws on a zero-length tag", async () => {
      // Arrange - Given
      const hashWithZeroLengthTag = "$argon2id$v=19$m=65536,t=3,p=4$ABCD$A"

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithZeroLengthTag)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should reject a valid signature whose declared algorithm differs from argon2id", async () => {
      // Arrange - Given
      const validHash = await passwordHash(TEST_PASSWORD)
      const hashWithDifferentAlgorithm = validHash.replace("argon2id", "argon2i0")

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithDifferentAlgorithm)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should reject a valid signature whose declared version differs from the configured one", async () => {
      // Arrange - Given
      const validHash = await passwordHash(TEST_PASSWORD)
      const hashWithDifferentVersion = validHash.replace("v=19", "v=18")

      // Act - When
      const output = await passwordVerify(TEST_PASSWORD, hashWithDifferentVersion)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })
  })

  describe("hashSha256Hex", () => {
    it("should return the SHA-256 hex digest of a string", () => {
      // Arrange - Given
      const input = "hello world"

      // Act - When
      const output = hashSha256Hex(input)

      // Assert - Then
      const expected = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
      assert.strictEqual(output, expected)
    })

    it("should return the SHA-256 hex digest of a Buffer", () => {
      // Arrange - Given
      const input = Buffer.from("hello world", "utf8")

      // Act - When
      const output = hashSha256Hex(input)

      // Assert - Then
      const expected = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
      assert.strictEqual(output, expected)
    })

    it("should produce different digests for different inputs", () => {
      // Act - When
      const output1 = hashSha256Hex("foo")
      const output2 = hashSha256Hex("bar")

      // Assert - Then
      assert.notStrictEqual(output1, output2)
    })
  })

  describe("passwordNeedsRehash", () => {
    it("should return false for hash with current parameters", async () => {
      // Arrange - Given
      const hash = await passwordHash(TEST_PASSWORD)

      // Act - When
      const output = passwordNeedsRehash(hash)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return true for hash with different parameters", async () => {
      // Arrange - Given
      const baseHash = await passwordHash(TEST_PASSWORD)
      const outdatedHashes = [
        baseHash.replace("m=65536", "m=32768"),
        baseHash.replace("t=3", "t=2"),
        baseHash.replace("p=4", "p=2"),
      ]

      // Assert - Then
      const expected = true
      for (const hash of outdatedHashes) {
        const output = passwordNeedsRehash(hash)
        assert.strictEqual(output, expected, `expected true for ${JSON.stringify(hash)}`)
      }
    })

    it("should return true for malformed hash strings", () => {
      // Arrange - Given
      const malformedHashes = [
        "",
        "not-a-phc-string",
        "$argon2i$v=19$m=65536,t=3,p=4$c2FsdA$dGFn",
        "$argon2id$v=18$m=65536,t=3,p=4$c2FsdA$dGFn",
        "$argon2id$v=19$m=65536,t=3$c2FsdA$dGFn",
      ]

      // Assert - Then
      const expected = true
      for (const hash of malformedHashes) {
        const output = passwordNeedsRehash(hash)
        assert.strictEqual(output, expected, `expected true for ${JSON.stringify(hash)}`)
      }
    })
  })

  describe("getIsApiKeyValid", () => {
    it("should return true for the configured API key", () => {
      // Arrange - Given
      const input = API_KEY

      // Act - When
      const output = getIsApiKeyValid(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return false for another key", () => {
      // Arrange - Given
      const input = `${API_KEY}-other`

      // Act - When
      const output = getIsApiKeyValid(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when the key is missing", () => {
      // Arrange - Given
      const input = null

      // Act - When
      const output = getIsApiKeyValid(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })
  })
})
