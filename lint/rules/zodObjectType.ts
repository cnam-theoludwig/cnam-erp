import type { IdentifierNode, Rule } from "../types.ts"
import { isArrowFunctionExpression, isFunctionExpression, isIdentifier } from "../types.ts"
import { getInferredSchemaName } from "../zod.ts"

export const zodObjectType: Rule<"inferredType"> = {
  meta: {
    type: "suggestion",
    docs: { description: "Every `ZodObject` schema has its inferred type next to it." },
    messages: {
      inferredType:
        "Declare the type of `{{schema}}` in this file (`export type Foo = z.infer<typeof FooZodObject>`).",
    },
    schema: [],
  },
  create: (context) => {
    const schemaIdentifiers: IdentifierNode[] = []
    const inferredSchemaNames = new Set<string>()
    return {
      VariableDeclarator: (node) => {
        if (
          isIdentifier(node.id) &&
          node.id.name.endsWith("ZodObject") &&
          node.init != null &&
          !isArrowFunctionExpression(node.init) &&
          !isFunctionExpression(node.init)
        ) {
          schemaIdentifiers.push(node.id)
        }
      },
      TSTypeAliasDeclaration: (node) => {
        const schemaName = getInferredSchemaName(node.typeAnnotation)
        if (schemaName != null) {
          inferredSchemaNames.add(schemaName)
        }
      },
      "Program:exit": () => {
        for (const schemaIdentifier of schemaIdentifiers) {
          if (!inferredSchemaNames.has(schemaIdentifier.name)) {
            context.report({
              node: schemaIdentifier,
              messageId: "inferredType",
              data: { schema: schemaIdentifier.name },
            })
          }
        }
      },
    }
  },
}
