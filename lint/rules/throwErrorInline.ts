import type { AstNode, NewExpressionNode, Rule } from "../types.ts"
import { isArrowFunctionExpression, isIdentifier } from "../types.ts"

const TRANSPARENT_PARENT_TYPES = new Set([
  "ConditionalExpression",
  "LogicalExpression",
  "ParenthesizedExpression",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "AwaitExpression",
])

const getErrorClassName = (node: NewExpressionNode): string | null => {
  if (!isIdentifier(node.callee) || !node.callee.name.endsWith("Error")) {
    return null
  }
  return node.callee.name
}

const getConsumer = (node: AstNode): { node: AstNode; parent: AstNode | null } => {
  let current = node
  while (current.parent != null && TRANSPARENT_PARENT_TYPES.has(current.parent.type)) {
    current = current.parent
  }
  return { node: current, parent: current.parent }
}

const isReturnedOrStored = (node: AstNode): boolean => {
  const consumer = getConsumer(node)
  if (consumer.parent == null) {
    return false
  }
  if (isArrowFunctionExpression(consumer.parent)) {
    return consumer.parent.body === consumer.node
  }
  return ["ReturnStatement", "VariableDeclarator", "AssignmentExpression"].includes(
    consumer.parent.type,
  )
}

export const throwErrorInline: Rule<"throwInline"> = {
  meta: {
    type: "suggestion",
    docs: { description: "An error is thrown where it is constructed, never returned or stored." },
    messages: {
      throwInline:
        "Write `throw new {{name}}(...)` where the error happens. Do not return an error from a function or store it in a variable.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      NewExpression: (node) => {
        const name = getErrorClassName(node)
        if (name == null || !isReturnedOrStored(node)) {
          return
        }
        context.report({ node, messageId: "throwInline", data: { name } })
      },
    }
  },
}
