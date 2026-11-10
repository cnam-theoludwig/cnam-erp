/**
 * Capitalize the first letter of a string.
 * @param string
 * @returns
 * @example capitalize("hello, world!") // "Hello, world!"
 */
export const capitalize = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const INITIALS_MAX_LENGTH = 2
const NON_ALPHANUMERIC_REGEX = /[^\p{Letter}\p{Number}]+/gu
const graphemeSegmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })

const getFirstGrapheme = (word: string): string => {
  const [firstSegment] = graphemeSegmenter.segment(word)
  return firstSegment?.segment ?? ""
}

/**
 * Extracts up to two uppercase initials from a name, taking the first character of its first two words.
 *
 * Accents are preserved, separators (spaces, underscores, dots, dashes) and symbols are ignored, and emoji-only or empty names fall back to the first alphanumeric character of the name.
 * @param name The name to extract initials from.
 * @param defaultValue The value to return when no initial can be extracted.
 * @returns
 * @example getInitials("Wild Frontier") // "WF"
 * @example getInitials("bas") // "B"
 */
export const getInitials = (name?: string | null, defaultValue = "?"): string => {
  const words = (name ?? "")
    .normalize("NFC")
    .split(NON_ALPHANUMERIC_REGEX)
    .filter((word) => {
      return word.length > 0
    })
  const initials = words
    .slice(0, INITIALS_MAX_LENGTH)
    .map((word) => {
      return getFirstGrapheme(word)
    })
    .join("")
    .toUpperCase()
  if (initials.length > 0) {
    return initials
  }
  return defaultValue
}

const HASH_INITIAL_VALUE = 5381
const HASH_MULTIPLIER = 33
const HASH_MODULO = 2 ** 32

/**
 * Hashes a string into a stable non-negative integer (djb2), so the same input always yields the same number.
 *
 * Not cryptographic — intended for deterministic presentational choices such as picking a color from a palette.
 * @param value The string to hash.
 * @returns
 * @example getStringHash("Wild Frontier") // 2452668020
 */
export const getStringHash = (value: string): number => {
  let hash = HASH_INITIAL_VALUE
  for (const character of value) {
    hash = (hash * HASH_MULTIPLIER + (character.codePointAt(0) ?? 0)) % HASH_MODULO
  }
  return hash
}

const COMBINING_DIACRITICAL_MARKS_REGEX = /[\u0300-\u036F]/gu

const removeAccents = (text: string): string => {
  return text.normalize("NFD").replace(COMBINING_DIACRITICAL_MARKS_REGEX, "")
}

/**
 * Converts a string into a URL-friendly slug.
 * Example: "Théo Martin!" becomes "theo-martin"
 * @param text The string to slugify.
 * @param defaultValue The value to return if the slug is empty.
 * @returns The slugified string.
 */
export const slugify = (text: string, defaultValue = "user"): string => {
  const slug = removeAccents(text.trim())
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(/\s/gu, "-")
    .replaceAll(/[^\w-]/gu, "")
    .replaceAll(/-+/gu, "-")
    .replace(/^-/u, "")
    .replace(/-$/u, "")
  if (slug.length > 0) {
    return slug
  }
  return defaultValue
}

export const getIsSlug = (value: string): boolean => {
  return /^[\da-z]+(?:-[\da-z]+)*$/u.test(value)
}

const MARKDOWN_CODE_FENCE_REGEX = /^ {0,3}(`{3,}|~{3,})[^\n]*\n?([\S\s]*?)(?:^ {0,3}\1[^\n]*$|$)/gmu
const MARKDOWN_INLINE_CODE_REGEX = /(`+)(?!`)([\S\s]*?[^`])\1(?!`)/gu
const MARKDOWN_IMAGE_REGEX = /!\[([^\]]*)\]\([^)]*\)/gu
const MARKDOWN_LINK_REGEX = /\[([^\]]*)\]\([^)]*\)/gu
const MARKDOWN_REFERENCE_DEFINITION_REGEX = /^ {0,3}\[[^\]]+\]:[^\n]*$/gmu
const MARKDOWN_AUTOLINK_REGEX = /<(https?:\/\/[^\s>]+)>/gu
const MARKDOWN_HEADING_REGEX = /^ {0,3}#{1,6}[\t ]+/gmu
const MARKDOWN_HEADING_TRAILING_REGEX = /[\t ]+#+[\t ]*$/gmu
const MARKDOWN_HEADING_SETEXT_REGEX = /^ {0,3}[=-]{2,}[\t ]*$/gmu
const MARKDOWN_THEMATIC_BREAK_REGEX = /^ {0,3}(?:\*[\t *]*|-[\t -]*|_[\t _]*)$/gmu
const MARKDOWN_BLOCKQUOTE_REGEX = /^ {0,3}(?:>[\t ]?)+/gmu
const MARKDOWN_LIST_MARKER_REGEX = /^[\t ]*(?:[*+-]|\d{1,9}[).])[\t ]+/gmu
const MARKDOWN_TABLE_DELIMITER_ROW_REGEX = /^ {0,3}\|?[\t :|-]*-[\t :|-]*\|?[\t ]*$/gmu
const MARKDOWN_TABLE_PIPE_REGEX = /[\t ]*\|[\t ]*/gu
const MARKDOWN_ASTERISK_EMPHASIS_REGEX = /(\*{1,3}|~{2})(?=\S)([\S\s]*?\S)\1/gu
const MARKDOWN_UNDERSCORE_EMPHASIS_REGEX = /(?<![\w_])(_{1,3})(?=\S)([\S\s]*?\S)\1(?![\w_])/gu
const MARKDOWN_ESCAPE_REGEX = /\\([\\`*_{}[\]()#+\-.!>~|])/gu
const WHITESPACE_REGEX = /\s+/gu

/**
 * Private Use Area characters standing in for backslash-escaped characters while the Markdown syntax is stripped, so that escaped characters are never mistaken for syntax (`\*\*not bold\*\*`).
 * Each escapable character maps to the placeholder at the same index.
 */
const MARKDOWN_ESCAPABLE_CHARACTERS = "\\`*_{}[]()#+-.!>~|".split("")
const PLACEHOLDER_FIRST_CODE_POINT = "\u{E000}".codePointAt(0) ?? 0
const PLACEHOLDER_CHARACTERS = MARKDOWN_ESCAPABLE_CHARACTERS.map((_character, index) => {
  return String.fromCodePoint(PLACEHOLDER_FIRST_CODE_POINT + index)
})

const getEscapedCharacterPlaceholder = (character: string): string => {
  const index = MARKDOWN_ESCAPABLE_CHARACTERS.indexOf(character)
  return PLACEHOLDER_CHARACTERS[index] ?? character
}

const getPlaceholderEscapedCharacter = (placeholder: string): string => {
  const index = PLACEHOLDER_CHARACTERS.indexOf(placeholder)
  return MARKDOWN_ESCAPABLE_CHARACTERS[index] ?? ""
}

const PLACEHOLDER_REGEX = /[\u{E000}-\u{E012}]/gu

/**
 * Strips Markdown syntax from a text, keeping only its readable content collapsed onto a single line.
 * Intended for plain-text contexts such as HTML meta descriptions.
 * @param text The Markdown text to strip.
 * @returns
 * @example stripMarkdown("**Hello**, [world](https://example.com)!") // "Hello, world!"
 */
export const stripMarkdown = (text: string): string => {
  return text
    .replace(PLACEHOLDER_REGEX, "")
    .replace(MARKDOWN_ESCAPE_REGEX, (_match: string, character: string) => {
      return getEscapedCharacterPlaceholder(character)
    })
    .replace(MARKDOWN_CODE_FENCE_REGEX, "$2")
    .replace(MARKDOWN_INLINE_CODE_REGEX, "$2")
    .replace(MARKDOWN_REFERENCE_DEFINITION_REGEX, "")
    .replace(MARKDOWN_IMAGE_REGEX, "$1")
    .replace(MARKDOWN_LINK_REGEX, "$1")
    .replace(MARKDOWN_AUTOLINK_REGEX, "$1")
    .replace(MARKDOWN_HEADING_SETEXT_REGEX, "")
    .replace(MARKDOWN_THEMATIC_BREAK_REGEX, "")
    .replace(MARKDOWN_HEADING_REGEX, "")
    .replace(MARKDOWN_HEADING_TRAILING_REGEX, "")
    .replace(MARKDOWN_BLOCKQUOTE_REGEX, "")
    .replace(MARKDOWN_LIST_MARKER_REGEX, "")
    .replace(MARKDOWN_TABLE_DELIMITER_ROW_REGEX, "")
    .replace(MARKDOWN_TABLE_PIPE_REGEX, " ")
    .replace(MARKDOWN_ASTERISK_EMPHASIS_REGEX, "$2")
    .replace(MARKDOWN_UNDERSCORE_EMPHASIS_REGEX, "$2")
    .replace(PLACEHOLDER_REGEX, (placeholder) => {
      return getPlaceholderEscapedCharacter(placeholder)
    })
    .replace(WHITESPACE_REGEX, " ")
    .trim()
}

const ELLIPSIS = "..."
const TRAILING_PARTIAL_WORD_REGEX = /\s\S*$/u
const TRAILING_PUNCTUATION_REGEX = /[\s!,.:;?]+$/u

/**
 * Truncates a text to at most `maxLength` characters, cutting on a word boundary and appending an ellipsis.
 * The returned text, ellipsis included, never exceeds `maxLength`.
 * @param text The text to truncate.
 * @param maxLength The maximum length of the returned text.
 * @returns
 * @example truncate("Hello, world!", 8) // "Hello..."
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text
  }
  const truncated = text.slice(0, Math.max(0, maxLength - ELLIPSIS.length))
  const onWordBoundary = truncated.replace(TRAILING_PARTIAL_WORD_REGEX, "")
  const kept = onWordBoundary.length > 0 ? onWordBoundary : truncated
  return `${kept.replace(TRAILING_PUNCTUATION_REGEX, "")}${ELLIPSIS}`
}

const REGEXP_SPECIAL_CHARACTERS_REGEX = /[.*+?^${}()|[\]\\]/gu

export const escapeRegExp = (value: string): string => {
  return value.replace(REGEXP_SPECIAL_CHARACTERS_REGEX, "\\$&")
}
