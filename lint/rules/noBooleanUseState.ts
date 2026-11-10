import type { AstNode, CallExpressionNode, Rule } from "../types.ts"
import { isIdentifier, isLiteral, isMemberExpression } from "../types.ts"

const isUseStateCallee = (callee: AstNode): boolean => {
  if (isIdentifier(callee)) {
    return callee.name === "useState"
  }
  return (
    isMemberExpression(callee) &&
    isIdentifier(callee.property) &&
    callee.property.name === "useState"
  )
}

const hasBooleanInitialValue = (node: CallExpressionNode): boolean => {
  const initialValue = node.arguments[0]
  return initialValue != null && isLiteral(initialValue) && typeof initialValue.value === "boolean"
}

const hasBooleanTypeArgument = (node: CallExpressionNode): boolean => {
  const typeArgument = node.typeArguments?.params[0]
  return typeArgument?.type === "TSBooleanKeyword"
}

export const noBooleanUseState: Rule<"useBoolean"> = {
  meta: {
    type: "suggestion",
    docs: { description: "Boolean state goes through `useBoolean`, not `useState`." },
    messages: {
      useBoolean:
        "Use `useBoolean` from `apps/web/src/Hook/useBoolean.ts`. It names the transitions (`setTrue`, `setFalse`, `toggle`) instead of scattering inline setters.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      CallExpression: (node) => {
        if (!isUseStateCallee(node.callee)) {
          return
        }
        if (hasBooleanInitialValue(node) || hasBooleanTypeArgument(node)) {
          context.report({ node, messageId: "useBoolean" })
        }
      },
    }
  },
}
