/**
 * Splits an array into consecutive arrays of at most `size` items.
 * @param items
 * @param size
 * @returns
 * @example chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export const chunk = <T>(items: T[], size: number): T[][] => {
  if (size <= 0) {
    throw new RangeError("Chunk size must be greater than 0.")
  }
  const chunks: T[][] = []
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }
  return chunks
}

export const deduplicate = <Value>(values: readonly Value[]): Value[] => {
  return Array.from(new Set(values))
}

export const getHasCommonValue = <Value>(
  valuesA: readonly Value[],
  valuesB: readonly Value[],
): boolean => {
  return valuesA.some((value) => {
    return valuesB.includes(value)
  })
}
