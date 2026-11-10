import assert from "node:assert/strict"
import { describe, it } from "bun:test"
import type { AutofillChanges, AutofillChangesInput } from "../object.ts"
import { deepMerge, getAutofillChanges, isDeepSubset } from "../object.ts"

describe("object", () => {
  describe("deepMerge", () => {
    it("should merge two simple objects", () => {
      // Arrange - Given
      const object1 = { a: 1, b: 2 }
      const object2 = { b: 3, c: 4 }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: 3, c: 4 }
      assert.deepStrictEqual(output, expected)
    })

    it("should deeply merge nested objects", () => {
      // Arrange - Given
      const object1 = { a: 1, b: { x: 2, y: 3 } }
      const object2 = { b: { y: 4, z: 5 }, c: 6 }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: { x: 2, y: 4, z: 5 }, c: 6 }
      assert.deepStrictEqual(output, expected)
    })

    it("should overwrite primitive values", () => {
      // Arrange - Given
      const object1 = { a: 1, b: "hello" }
      const object2 = { a: 2, b: "world" }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 2, b: "world" }
      assert.deepStrictEqual(output, expected)
    })

    it("should return the second object if the first is empty", () => {
      // Arrange - Given
      const object1 = {}
      const object2 = { a: 1, b: 2 }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: 2 }
      assert.deepStrictEqual(output, expected)
    })

    it("should return the first object if the second is empty", () => {
      // Arrange - Given
      const object1 = { a: 1, b: 2 }
      const object2 = {}

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: 2 }
      assert.deepStrictEqual(output, expected)
    })

    it("should handle null and undefined values correctly", () => {
      // Arrange - Given
      const object1 = { a: 1, b: null }
      const object2 = { b: { c: 2 }, d: undefined }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: { c: 2 }, d: undefined }
      assert.deepStrictEqual(output, expected)
    })

    it("should not pollute Object.prototype via __proto__ key", () => {
      // Arrange - Given
      const object1 = { a: 1 }
      const malicious = JSON.parse('{"__proto__": {"polluted": "yes"}}') as Record<string, unknown>

      // Act - When
      const output = deepMerge(object1, malicious)

      // Assert - Then
      assert.strictEqual(({} as Record<string, unknown>)["polluted"], undefined)
      assert.strictEqual((output as Record<string, unknown>)["polluted"], undefined)
      assert.strictEqual(Object.getPrototypeOf(output), Object.prototype)
    })

    it("should skip inherited (non-own) keys via for-in", () => {
      // Arrange - Given
      const parent = { inherited: "value" }
      const object2 = Object.create(parent) as Record<string, unknown>
      object2["own"] = "own-value"

      // Act - When
      const output = deepMerge({ a: 1 }, object2)

      // Assert - Then
      const expected = {
        merged: { a: 1, own: "own-value" },
        inherited: undefined,
      }
      assert.deepStrictEqual(output, expected.merged)
      assert.strictEqual((output as Record<string, unknown>)["inherited"], expected.inherited)
    })

    it("should assign null directly without recursing into it as an object", () => {
      // Arrange - Given
      const object1 = { a: 1 } as Record<string, unknown>
      const object2 = { b: null }

      // Act - When
      const output = deepMerge(object1, object2)

      // Assert - Then
      const expected = { a: 1, b: null }
      assert.deepStrictEqual(output, expected)
    })

    it("should ignore constructor and prototype keys", () => {
      // Arrange - Given
      const object1 = { a: 1 }
      const malicious = JSON.parse(
        '{"constructor": {"prototype": {"polluted": "yes"}}, "prototype": {"polluted": "yes"}}',
      ) as Record<string, unknown>

      // Act - When
      const output = deepMerge(object1, malicious)

      // Assert - Then
      assert.strictEqual(({} as Record<string, unknown>)["polluted"], undefined)
      assert.deepStrictEqual(output, { a: 1 })
    })
  })

  describe("isDeepSubset", () => {
    it("should return true when subset equals superset", () => {
      // Arrange - Given
      const subset = { a: 1, b: "hello" }
      const superset = { a: 1, b: "hello" }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return true when superset has extra keys beyond subset", () => {
      // Arrange - Given
      const subset = { a: 1 }
      const superset = { a: 1, b: 2, c: 3 }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return true when subset is an empty object", () => {
      // Arrange - Given
      const subset = {}
      const superset = { a: 1, b: 2 }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should match nested subsets", () => {
      // Arrange - Given
      const subset = { a: { x: 1 } }
      const superset = { a: { x: 1, y: 2 }, b: 3 }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return false when a primitive value differs", () => {
      // Arrange - Given
      const subset = { a: 1 }
      const superset = { a: 2 }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when subset key is missing in superset", () => {
      // Arrange - Given
      const subset = { a: 1 }
      const superset = {}

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when a nested value differs", () => {
      // Arrange - Given
      const subset = { a: { x: 1 } }
      const superset = { a: { x: 2 } }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when subset is an object and superset is a primitive", () => {
      // Arrange - Given
      const subset = { a: 1 }
      const superset = 1

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when subset is non-null and superset is null", () => {
      // Arrange - Given
      const subset = { a: 1 }
      const superset = null

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return true when both values are null", () => {
      // Arrange - Given
      const subset = null
      const superset = null

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return true when both primitives are equal", () => {
      // Arrange - Given
      const subset = 42
      const superset = 42

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })

    it("should return false when subset is null and superset is a non-null object", () => {
      // Arrange - Given
      const subset = null
      const superset = { a: 1 }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when subset is a primitive and superset is an object", () => {
      // Arrange - Given
      const subset = 1
      const superset = { a: 1 }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should return false when subset is an empty object and superset is a primitive", () => {
      // Arrange - Given
      const subset = {}
      const superset = "not-an-object"

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = false
      assert.strictEqual(output, expected)
    })

    it("should support partial metadata match over recorded call input", () => {
      // Arrange - Given
      const subset = { paymentId: "payment_test", metadata: { reason: "dispute" } }
      const superset = {
        paymentId: "payment_test",
        metadata: { orderId: "order_123", reason: "dispute" },
        idempotencyKey: "refund_order_123",
      }

      // Act - When
      const output = isDeepSubset(subset, superset)

      // Assert - Then
      const expected = true
      assert.strictEqual(output, expected)
    })
  })

  describe("getAutofillChanges", () => {
    interface Values {
      website: string | null | undefined
      city: string | null | undefined
      tags: string[]
    }

    it("should fill the fields that are still empty", () => {
      // Arrange - Given
      const input: AutofillChangesInput<Values> = {
        valuesCurrent: { website: "", city: null, tags: [] },
        valuesSuggested: { website: "https://example.com", city: "Strasbourg", tags: ["a"] },
      }

      // Act - When
      const output = getAutofillChanges(input)

      // Assert - Then
      const expected: AutofillChanges<Values> = {
        fieldsToFill: { website: "https://example.com", city: "Strasbourg", tags: ["a"] },
        fieldsInConflict: [],
      }
      assert.deepStrictEqual(output, expected)
    })

    it("should fill a field that only holds whitespace", () => {
      // Arrange - Given
      const input: AutofillChangesInput<Values> = {
        valuesCurrent: { website: " \n", city: undefined, tags: [] },
        valuesSuggested: { website: "https://example.com" },
      }

      // Act - When
      const output = getAutofillChanges(input)

      // Assert - Then
      const expected: AutofillChanges<Values> = {
        fieldsToFill: { website: "https://example.com" },
        fieldsInConflict: [],
      }
      assert.deepStrictEqual(output, expected)
    })

    it("should never overwrite a field that already holds another value, and report both values instead", () => {
      // Arrange - Given
      const input: AutofillChangesInput<Values> = {
        valuesCurrent: { website: "https://old.example.com", city: "", tags: ["a"] },
        valuesSuggested: { website: "https://example.com", city: "Strasbourg", tags: ["b", "c"] },
      }

      // Act - When
      const output = getAutofillChanges(input)

      // Assert - Then
      const expected: AutofillChanges<Values> = {
        fieldsToFill: { city: "Strasbourg" },
        fieldsInConflict: [
          {
            field: "website",
            valueCurrent: "https://old.example.com",
            valueSuggested: "https://example.com",
          },
          { field: "tags", valueCurrent: ["a"], valueSuggested: ["b", "c"] },
        ],
      }
      assert.deepStrictEqual(output, expected)
    })

    it("should overwrite only the fields a human settled in favour of the suggestion", () => {
      // Arrange - Given
      const input: AutofillChangesInput<Values> = {
        valuesCurrent: { website: "https://old.example.com", city: "Paris", tags: ["a"] },
        valuesSuggested: { website: "https://example.com", city: "Strasbourg", tags: ["b"] },
        fieldsToOverwrite: ["website", "tags"],
      }

      // Act - When
      const output = getAutofillChanges(input)

      // Assert - Then
      const expected: AutofillChanges<Values> = {
        fieldsToFill: { website: "https://example.com", tags: ["b"] },
        fieldsInConflict: [{ field: "city", valueCurrent: "Paris", valueSuggested: "Strasbourg" }],
      }
      assert.deepStrictEqual(output, expected)
    })

    it("should ignore a suggestion equal to the current value, whatever the order of a list", () => {
      // Arrange - Given
      const input: AutofillChangesInput<Values> = {
        valuesCurrent: { website: "https://example.com", city: "Strasbourg", tags: ["a", "b"] },
        valuesSuggested: { website: "https://example.com", city: "Strasbourg", tags: ["b", "a"] },
      }

      // Act - When
      const output = getAutofillChanges(input)

      // Assert - Then
      const expected: AutofillChanges<Values> = { fieldsToFill: {}, fieldsInConflict: [] }
      assert.deepStrictEqual(output, expected)
    })

    it("should report a list that repeats a value the suggestion holds once", () => {
      // Arrange - Given
      const input: AutofillChangesInput<Values> = {
        valuesCurrent: { website: null, city: null, tags: ["a", "a"] },
        valuesSuggested: { tags: ["a", "b"] },
      }

      // Act - When
      const output = getAutofillChanges(input)

      // Assert - Then
      const expected: AutofillChanges<Values> = {
        fieldsToFill: {},
        fieldsInConflict: [{ field: "tags", valueCurrent: ["a", "a"], valueSuggested: ["a", "b"] }],
      }
      assert.deepStrictEqual(output, expected)
    })

    it("should ignore a suggestion that has nothing to offer", () => {
      // Arrange - Given
      const input: AutofillChangesInput<Values> = {
        valuesCurrent: { website: "https://example.com", city: "", tags: ["a"] },
        valuesSuggested: { website: null, city: "", tags: [] },
      }

      // Act - When
      const output = getAutofillChanges(input)

      // Assert - Then
      const expected: AutofillChanges<Values> = { fieldsToFill: {}, fieldsInConflict: [] }
      assert.deepStrictEqual(output, expected)
    })
  })
})
