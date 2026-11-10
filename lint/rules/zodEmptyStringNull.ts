import type { AstNode, Rule } from "../types.ts"
import {
  isArrowFunctionExpression,
  isCallExpression,
  isFunctionExpression,
  isIdentifier,
  isLiteral,
  isMemberExpression,
} from "../types.ts"

const EQUALITY_OPERATORS = new Set(["===", "!==", "==", "!="])

const isEmptyString = (node: AstNode): boolean => {
  return isLiteral(node) && node.value === ""
}

const isZodTransformCallee = (callee: AstNode): boolean => {
  return (
    isMemberExpression(callee) &&
    isIdentifier(callee.property) &&
    (callee.property.name === "transform" || callee.property.name === "preprocess")
  )
}

const getEnclosingFunction = (node: AstNode): AstNode | null => {
  let current = node.parent
  while (current != null && !isArrowFunctionExpression(current) && !isFunctionExpression(current)) {
    current = current.parent
  }
  return current
}

const isInZodTransform = (node: AstNode): boolean => {
  const enclosingFunction = getEnclosingFunction(node)
  const call = enclosingFunction?.parent
  return call != null && isCallExpression(call) && isZodTransformCallee(call.callee)
}

export const zodEmptyStringNull: Rule<"emptyStringUnion"> = {
  meta: {
    type: "suggestion",
    docs: { description: "Zod schemas map an empty string to `null` through a union." },
    messages: {
      emptyStringUnion:
        'Map an empty string to `null` with `z.union([z.literal("").transform(() => null), ActualZod]).nullish()`, not by comparing to `""` in a transform.',
    },
    schema: [],
  },
  create: (context) => {
    return {
      BinaryExpression: (node) => {
        if (
          EQUALITY_OPERATORS.has(node.operator) &&
          (isEmptyString(node.left) || isEmptyString(node.right)) &&
          isInZodTransform(node)
        ) {
          context.report({ node, messageId: "emptyStringUnion" })
        }
      },
    }
  },
}
