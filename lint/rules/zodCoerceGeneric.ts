import type { AstNode, Rule } from "../types.ts"
import { isIdentifier, isMemberExpression } from "../types.ts"

const isZodCoerceCallee = (callee: AstNode): boolean => {
  return (
    isMemberExpression(callee) &&
    isMemberExpression(callee.object) &&
    isIdentifier(callee.object.property) &&
    callee.object.property.name === "coerce"
  )
}

export const zodCoerceGeneric: Rule<"explicitGeneric"> = {
  meta: {
    type: "problem",
    docs: { description: "`z.coerce` schemas take an explicit generic." },
    messages: {
      explicitGeneric:
        "Pass the input type explicitly (`z.coerce.number<number>()`). Without it the input type is `unknown` and `z.infer` breaks.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        if (isZodCoerceCallee(node.callee) && node.typeArguments == null) {
          context.report({ node, messageId: "explicitGeneric" })
        }
      },
    }
  },
}
