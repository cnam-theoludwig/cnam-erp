import type { AstNode, Rule } from "../types.ts"
import { isCallExpression, isIdentifier, isMemberExpression } from "../types.ts"

const isZodObjectCall = (node: AstNode | null): boolean => {
  return (
    node != null &&
    isCallExpression(node) &&
    isMemberExpression(node.callee) &&
    isIdentifier(node.callee.object) &&
    node.callee.object.name === "z" &&
    isIdentifier(node.callee.property) &&
    node.callee.property.name === "object"
  )
}

export const zodObjectNaming: Rule<"zodObjectSuffix"> = {
  meta: {
    type: "suggestion",
    docs: { description: "`z.object(...)` schemas end in `ZodObject`." },
    messages: {
      zodObjectSuffix:
        "Name `z.object(...)` schemas `FooZodObject`. `FooZod` is the plain object of fields (`export const FooZodObject = z.object(FooZod)`).",
    },
    schema: [],
  },
  create: (context) => {
    return {
      VariableDeclarator: (node) => {
        if (
          isIdentifier(node.id) &&
          isZodObjectCall(node.init) &&
          !node.id.name.endsWith("ZodObject")
        ) {
          context.report({ node: node.id, messageId: "zodObjectSuffix" })
        }
      },
    }
  },
}
