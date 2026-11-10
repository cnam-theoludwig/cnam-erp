import type { Primitive } from "./type.ts"

/**
 * Calculate the ratio of a value to a total.
 *
 * Manage edge cases where the total is 0 or negative.
 * @param value
 * @param total
 * @returns
 * @example calculateRatio(3, 10) // 0.3
 */
export const calculateRatio = (value: number, total: number): number => {
  if (total <= 0) {
    return 0
  }
  return value / total
}

/**
 * Calculate the sum of an array of numbers.
 * @param numbers
 * @returns
 * @example calculateSum([1, 2, 3]) // 6
 */
export const calculateSum = (numbers: number[]): number => {
  return numbers.reduce((total, current) => {
    return total + current
  }, 0)
}

/**
 * Calculate the average of an array of numbers.
 * @param numbers
 * @returns
 * @example calculateAverage([1, 2, 3]) // 2
 */
export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length <= 0) {
    return 0
  }
  return calculateSum(numbers) / numbers.length
}

/** The number of whole percents in a ratio of 1. */
export const RATIO_PER_PERCENT = 100

/**
 * Convert a ratio to its whole-percent value.
 * @param ratio
 * @returns
 * @example ratioToPercent(0.9) // 90
 */
export const ratioToPercent = (ratio: number): number => {
  return calculateRatio(ratio, 1 / RATIO_PER_PERCENT)
}

/**
 * Convert a whole-percent value to its ratio.
 * @param percent
 * @returns
 * @example percentToRatio(90) // 0.9
 */
export const percentToRatio = (percent: number): number => {
  return calculateRatio(percent, RATIO_PER_PERCENT)
}

export const sortCompare = <T extends Primitive>(a: T, b: T): number => {
  if (a === b || a == null || b == null) {
    return 0
  }
  if (a > b) {
    return 1
  }
  return -1
}

/** The largest value a signed 32-bit integer can hold. */
export const INTEGER_SIGNED_32_BIT_MAXIMUM = 2 ** 31 - 1

export interface ClampInput {
  value: number
  minimum: number
  maximum: number
}

/**
 * Keep a value within an inclusive range.
 * @example clamp({ value: 15, minimum: 0, maximum: 10 }) // 10
 */
export const clamp = (input: ClampInput): number => {
  const { value, minimum, maximum } = input
  return Math.min(Math.max(value, minimum), maximum)
}

/**
 * Read a number from a text input value.
 *
 * An empty value is "nothing typed", not 0.
 * @example parseNumberInput("") // null
 * @example parseNumberInput("12.5") // 12.5
 */
export const parseNumberInput = (value: string): number | null => {
  const parsedValue = Number(value)
  if (value === "" || Number.isNaN(parsedValue)) {
    return null
  }
  return parsedValue
}
