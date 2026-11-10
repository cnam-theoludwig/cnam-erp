import type { Rule } from "../types.ts"
import { getInferredSchemaName } from "../zod.ts"

const getSchemaBaseName = (schemaName: string): string | null => {
  const suffix = ["ZodObject", "Zod"].find((candidate) => {
    return schemaName.endsWith(candidate)
  })
  return suffix == null ? null : schemaName.slice(0, -suffix.length)
}

export const zodTypeName: Rule<"typeNameMatchesSchema"> = {
  meta: {
    type: "suggestion",
    docs: { description: "A type inferred from a Zod schema takes the name of the schema." },
    messages: {
      typeNameMatchesSchema:
        "Name the type `{{expected}}`, after its schema `{{schema}}` (`export type Foo = z.infer<typeof FooZodObject>`).",
    },
    schema: [],
  },
  create: (context) => {
    return {
      TSTypeAliasDeclaration: (node) => {
        const schemaName = getInferredSchemaName(node.typeAnnotation)
        if (schemaName == null) {
          return
        }
        const expected = getSchemaBaseName(schemaName)
        if (expected != null && node.id.name !== expected) {
          context.report({
            node: node.id,
            messageId: "typeNameMatchesSchema",
            data: { expected, schema: schemaName },
          })
        }
      },
    }
  },
}
