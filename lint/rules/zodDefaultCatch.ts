import type { AstNode, Rule } from "../types.ts"
import { isCallExpression, isIdentifier, isMemberExpression } from "../types.ts"

const isMethodCall = (node: AstNode, methodName: string): boolean => {
  return (
    isCallExpression(node) &&
    isMemberExpression(node.callee) &&
    isIdentifier(node.callee.property) &&
    node.callee.property.name === methodName
  )
}

export const zodDefaultCatch: Rule<"getDefaultCatchZod"> = {
  meta: {
    type: "suggestion",
    docs: { description: "Default-with-fallback schemas use `getDefaultCatchZod`." },
    messages: {
      getDefaultCatchZod:
        "Use `getDefaultCatchZod(schema, defaultValue)` from `@repo/models/Entity`, not `.default(...).catch(...)`.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        if (
          isMethodCall(node, "catch") &&
          isMemberExpression(node.callee) &&
          isMethodCall(node.callee.object, "default")
        ) {
          context.report({ node, messageId: "getDefaultCatchZod" })
        }
      },
    }
  },
}
