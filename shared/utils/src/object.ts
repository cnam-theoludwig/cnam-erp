const FORBIDDEN_MERGE_KEYS = new Set(["__proto__", "constructor", "prototype"])

export const deepMerge = <Object1 extends object, Object2 extends object = Object1>(
  object1: Object1,
  object2: Object2,
): Object1 & Object2 => {
  const result = { ...object1 } as Object1 & Object2
  for (const key in object2) {
    if (!Object.hasOwn(object2, key)) {
      continue
    }
    if (FORBIDDEN_MERGE_KEYS.has(key)) {
      continue
    }
    if (typeof object2[key] === "object" && object2[key] !== null) {
      result[key] = deepMerge(result[key] as any, object2[key] as any)
    } else {
      result[key] = object2[key] as any
    }
  }
  return result
}

export const isDeepSubset = (subset: unknown, superset: unknown): boolean => {
  if (subset === superset) {
    return true
  }
  if (subset == null || superset == null) {
    return false
  }
  if (typeof subset !== "object" || typeof superset !== "object") {
    return false
  }
  for (const key of Object.keys(subset)) {
    const subsetValue = (subset as Record<string, unknown>)[key]
    const supersetValue = (superset as Record<string, unknown>)[key]
    if (!isDeepSubset(subsetValue, supersetValue)) {
      return false
    }
  }
  return true
}

const getIsEmptyValue = (value: unknown): boolean => {
  if (typeof value === "string") {
    return value.trim().length <= 0
  }
  return value == null || (Array.isArray(value) && value.length <= 0)
}

const getIsAutofillValueEqual = (value1: unknown, value2: unknown): boolean => {
  if (Array.isArray(value1) && Array.isArray(value2)) {
    if (value1.length !== value2.length) {
      return false
    }
    const countByValue = new Map<unknown, number>()
    for (const value of value1) {
      countByValue.set(value, (countByValue.get(value) ?? 0) + 1)
    }
    return value2.every((value) => {
      const count = countByValue.get(value) ?? 0
      countByValue.set(value, count - 1)
      return count > 0
    })
  }
  return value1 === value2
}

export type AutofillConflict<Values extends object> = {
  [Field in keyof Values]-?: {
    field: Field
    valueCurrent: Values[Field]
    valueSuggested: NonNullable<Values[Field]>
  }
}[keyof Values]

export interface AutofillChangesInput<Values extends object> {
  valuesCurrent: Values
  valuesSuggested: { [Field in keyof Values]?: Values[Field] | null }
  fieldsToOverwrite?: Array<keyof Values>
}

export interface AutofillChanges<Values extends object> {
  fieldsToFill: Partial<Values>
  fieldsInConflict: Array<AutofillConflict<Values>>
}

/**
 * An autofill never overwrites on its own. A suggestion fills an empty field, and a field that already holds another value is reported as a conflict for a human to settle. `fieldsToOverwrite` are the conflicts the human settled in favour of the suggestion.
 */
export const getAutofillChanges = <Values extends object>(
  input: AutofillChangesInput<Values>,
): AutofillChanges<Values> => {
  const { valuesCurrent, valuesSuggested, fieldsToOverwrite = [] } = input
  const changes: AutofillChanges<Values> = { fieldsToFill: {}, fieldsInConflict: [] }
  for (const field of Object.keys(valuesSuggested) as Array<keyof Values>) {
    const valueSuggested = valuesSuggested[field]
    const valueCurrent = valuesCurrent[field]
    if (
      valueSuggested == null ||
      getIsEmptyValue(valueSuggested) ||
      getIsAutofillValueEqual(valueSuggested, valueCurrent)
    ) {
      continue
    }
    if (getIsEmptyValue(valueCurrent) || fieldsToOverwrite.includes(field)) {
      changes.fieldsToFill[field] = valueSuggested
    } else {
      changes.fieldsInConflict.push({ field, valueCurrent, valueSuggested })
    }
  }
  return changes
}
