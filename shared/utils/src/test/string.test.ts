import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import {
  capitalize,
  escapeRegExp,
  getInitials,
  getIsSlug,
  getStringHash,
  slugify,
  stripMarkdown,
  truncate,
} from "../string.ts"

describe("string", () => {
  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      // Arrange - Given
      const input = "hello, world!"

      // Act - When
      const output = capitalize(input)

      // Assert - Then
      const expected = "Hello, world!"
      assert.strictEqual(output, expected)
    })

    it("should return an empty string when the input is an empty string", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = capitalize(input)

      // Assert - Then
      const expected = ""
      assert.strictEqual(output, expected)
    })

    it("should return the same string when the first letter is already capitalized", () => {
      // Arrange - Given
      const input = "Hello, world!"

      // Act - When
      const output = capitalize(input)

      // Assert - Then
      const expected = "Hello, world!"
      assert.strictEqual(output, expected)
    })
  })

  describe("slugify", () => {
    it('should convert "Théo Martin!" to "theo-martin"', () => {
      // Arrange - Given
      const input = "Théo Martin!"

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "theo-martin"
      assert.strictEqual(output, expected)
    })

    it('should convert "MannyGw -.-" to "mannygw"', () => {
      // Arrange - Given
      const input = "MannyGw -.-"

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "mannygw"
      assert.strictEqual(output, expected)
    })

    it('should return default value "user" for string with only special characters', () => {
      // Arrange - Given
      const input = "!@#$%^&*()"

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "user"
      assert.strictEqual(output, expected)
    })

    it("should replace underscores with single dashes", () => {
      // Arrange - Given
      const input = "hello_world"

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "hello-world"
      assert.strictEqual(output, expected)
    })

    it("should collapse runs of dashes produced by underscores and spaces into a single dash", () => {
      // Arrange - Given
      const input = "a_ _b"

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "a-b"
      assert.strictEqual(output, expected)
    })

    it("should strip a leading dash produced by an underscore at the start", () => {
      // Arrange - Given
      const input = "-_abc"

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "abc"
      assert.strictEqual(output, expected)
    })

    it("should strip a trailing dash produced by an underscore at the end", () => {
      // Arrange - Given
      const input = "abc_-"

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "abc"
      assert.strictEqual(output, expected)
    })

    it("should trim leading and trailing whitespace before applying transformations", () => {
      // Arrange - Given
      const input = "  hello  "

      // Act - When
      const output = slugify(input)

      // Assert - Then
      const expected = "hello"
      assert.strictEqual(output, expected)
    })
  })

  describe("getIsSlug", () => {
    it('should return true for "theo-martin"', () => {
      // Arrange - Given
      const input = "theo-martin"

      // Act - When
      const output = getIsSlug(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it('should return false for "Theo Martin!"', () => {
      // Arrange - Given
      const input = "Theo Martin!"

      // Act - When
      const output = getIsSlug(input)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should reject invalid strings", () => {
      // Arrange - Given
      const inputs = [
        "-abc",
        "abc-",
        "two--dashes",
        "Bad",
        "with space",
        "emoji-🚀",
        "UPPER",
        "under_score",
      ]

      // Act - When
      const outputs = inputs.map((input) => {
        return getIsSlug(input)
      })

      // Assert - Then
      const expected = inputs.map(() => {
        return false
      })
      assert.deepStrictEqual(outputs, expected)
    })

    it("should accept valid strings", () => {
      // Arrange - Given
      const inputs = ["a", "abc", "abc-123", "abc-123-def", "a1-b2-c3", "theo-martin", "123"]

      // Act - When
      const outputs = inputs.map((input) => {
        return getIsSlug(input)
      })

      // Assert - Then
      const expected = inputs.map(() => {
        return true
      })
      assert.deepStrictEqual(outputs, expected)
    })
  })

  describe("stripMarkdown", () => {
    it("should strip bold, italic and strikethrough emphasis", () => {
      // Arrange - Given
      const input = "**Bold** and *italic* and _underscored_ and ***both*** and ~~struck~~."

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "Bold and italic and underscored and both and struck."
      assert.strictEqual(output, expected)
    })

    it("should strip headings", () => {
      // Arrange - Given
      const input = "# About me\n\nI make videos.\n\n## Games ##\n\nARK"

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "About me I make videos. Games ARK"
      assert.strictEqual(output, expected)
    })

    it("should keep the text of links and images while removing their URLs", () => {
      // Arrange - Given
      const input =
        "Watch on [YouTube](https://youtube.com/@johnson) and ![my banner](https://files.fusey.gg/banner.png)"

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "Watch on YouTube and my banner"
      assert.strictEqual(output, expected)
    })

    it("should strip list markers, blockquotes and thematic breaks", () => {
      // Arrange - Given
      const input = "- First\n- Second\n\n1. One\n2. Two\n\n> Quoted line\n\n---\n\nEnd"

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "First Second One Two Quoted line End"
      assert.strictEqual(output, expected)
    })

    it("should strip code fences and inline code while keeping their content", () => {
      // Arrange - Given
      const input = "Run `pnpm install` first.\n\n```bash\nnode --run test\n```"

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "Run pnpm install first. node --run test"
      assert.strictEqual(output, expected)
    })

    it("should strip table syntax while keeping cell content", () => {
      // Arrange - Given
      const input = "| Game | Views |\n| --- | --- |\n| ARK | 100k |"

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "Game Views ARK 100k"
      assert.strictEqual(output, expected)
    })

    it("should unescape escaped Markdown characters", () => {
      // Arrange - Given
      const input = "I love 5 \\* 5 and \\*\\*not bold\\*\\*"

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "I love 5 * 5 and **not bold**"
      assert.strictEqual(output, expected)
    })

    it("should collapse whitespace and trim", () => {
      // Arrange - Given
      const input = "  Line one\n\n\nLine   two  \n"

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "Line one Line two"
      assert.strictEqual(output, expected)
    })

    it("should return an empty string when the input is an empty string", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = ""
      assert.strictEqual(output, expected)
    })

    it("should leave plain text unchanged", () => {
      // Arrange - Given
      const input = "ARK meme videos for a 100k audience."

      // Act - When
      const output = stripMarkdown(input)

      // Assert - Then
      const expected = "ARK meme videos for a 100k audience."
      assert.strictEqual(output, expected)
    })
  })

  describe("truncate", () => {
    it("should return the text unchanged when it is shorter than the maximum length", () => {
      // Arrange - Given
      const input = "ARK meme videos."

      // Act - When
      const output = truncate(input, 160)

      // Assert - Then
      const expected = "ARK meme videos."
      assert.strictEqual(output, expected)
    })

    it("should return the text unchanged when it is exactly the maximum length", () => {
      // Arrange - Given
      const input = "ARK memes"

      // Act - When
      const output = truncate(input, input.length)

      // Assert - Then
      const expected = "ARK memes"
      assert.strictEqual(output, expected)
    })

    it("should cut on a word boundary and append an ellipsis", () => {
      // Arrange - Given
      const input = "I make ARK memes for a very large audience"

      // Act - When
      const output = truncate(input, 20)

      // Assert - Then
      const expected = "I make ARK memes..."
      assert.strictEqual(output, expected)
    })

    it("should never exceed the maximum length", () => {
      // Arrange - Given
      const input = "a".repeat(500)

      // Act - When
      const output = truncate(input, 160)

      // Assert - Then
      assert.ok(output.length <= 160)
      assert.ok(output.endsWith("..."))
    })

    it("should strip trailing punctuation before the ellipsis", () => {
      // Arrange - Given
      const input = "I make ARK memes, and much more besides"

      // Act - When
      const output = truncate(input, 22)

      // Assert - Then
      const expected = "I make ARK memes..."
      assert.strictEqual(output, expected)
    })

    it("should cut mid-word when the first word is longer than the maximum length", () => {
      // Arrange - Given
      const input = "Supercalifragilisticexpialidocious"

      // Act - When
      const output = truncate(input, 10)

      // Assert - Then
      const expected = "Superca..."
      assert.strictEqual(output, expected)
      assert.ok(output.length <= 10)
    })

    it("should return an empty string when the input is an empty string", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = truncate(input, 160)

      // Assert - Then
      const expected = ""
      assert.strictEqual(output, expected)
    })
  })

  describe("getInitials", () => {
    it("should return the first letter of the first two words", () => {
      // Arrange - Given
      const input = "Wild Frontier"

      // Act - When
      const output = getInitials(input)

      // Assert - Then
      const expected = "WF"
      assert.strictEqual(output, expected)
    })

    it("should return a single uppercase initial when the name is one word", () => {
      // Arrange - Given
      const input = "bas"

      // Act - When
      const output = getInitials(input)

      // Assert - Then
      const expected = "B"
      assert.strictEqual(output, expected)
    })

    it("should ignore words beyond the first two", () => {
      // Arrange - Given
      const input = "Jean Michel Dupont"

      // Act - When
      const output = getInitials(input)

      // Assert - Then
      const expected = "JM"
      assert.strictEqual(output, expected)
    })

    it("should treat separators and symbols as word boundaries", () => {
      // Arrange - Given
      const input = "  pixel_pirate!! "

      // Act - When
      const output = getInitials(input)

      // Assert - Then
      const expected = "PP"
      assert.strictEqual(output, expected)
    })

    it("should preserve accented letters", () => {
      // Arrange - Given
      const input = "Théo Ludwig"

      // Act - When
      const output = getInitials(input)

      // Assert - Then
      const expected = "TL"
      assert.strictEqual(output, expected)
    })

    it("should return the default value when the name has no alphanumeric character", () => {
      // Arrange - Given
      const input = "🎮 🎧"

      // Act - When
      const output = getInitials(input)

      // Assert - Then
      const expected = "?"
      assert.strictEqual(output, expected)
    })

    it("should return the default value when the name is nullish", () => {
      // Arrange - Given
      const input = null

      // Act - When
      const output = getInitials(input, "U")

      // Assert - Then
      const expected = "U"
      assert.strictEqual(output, expected)
    })
  })

  describe("getStringHash", () => {
    it("should return the same hash for the same input", () => {
      // Arrange - Given
      const input = "Wild Frontier"

      // Act - When
      const output = getStringHash(input)

      // Assert - Then
      const expected = getStringHash("Wild Frontier")
      assert.strictEqual(output, expected)
    })

    it("should return different hashes for different inputs", () => {
      // Arrange - Given
      const input = ["Wild Frontier", "Nova Squad"]

      // Act - When
      const output = input.map((value) => {
        return getStringHash(value)
      })

      // Assert - Then
      const expected = 2
      assert.strictEqual(new Set(output).size, expected)
    })

    it("should return a non-negative safe integer", () => {
      // Arrange - Given
      const input = "Théo Ludwig 🎮"

      // Act - When
      const output = getStringHash(input)

      // Assert - Then
      const expected = true
      assert.strictEqual(Number.isSafeInteger(output) && output >= 0, expected)
    })

    it("should return the initial hash value for an empty string", () => {
      // Arrange - Given
      const input = ""

      // Act - When
      const output = getStringHash(input)

      // Assert - Then
      const expected = 5381
      assert.strictEqual(output, expected)
    })
  })

  describe("escapeRegExp", () => {
    it("should escape every regular expression special character", () => {
      // Arrange - Given
      const input = "https://files.example.com/uploads/?a=[1]+(2)*{3}^$|\\."

      // Act - When
      const output = escapeRegExp(input)

      // Assert - Then
      const expected =
        "https://files\\.example\\.com/uploads/\\?a=\\[1\\]\\+\\(2\\)\\*\\{3\\}\\^\\$\\|\\\\\\."
      assert.strictEqual(output, expected)
      assert.strictEqual(new RegExp(output, "u").test(input), true)
    })
  })
})
