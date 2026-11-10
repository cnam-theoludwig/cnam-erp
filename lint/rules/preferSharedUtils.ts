import type { AstNode, BinaryExpressionNode, CallExpressionNode, Rule } from "../types.ts"
import {
  isArrayExpression,
  isBinaryExpression,
  isCallExpression,
  isIdentifier,
  isLiteral,
  isMemberExpression,
  isSpreadElement,
} from "../types.ts"

type PreferSharedUtilsMessageId =
  | "capitalize"
  | "clamp"
  | "deduplicate"
  | "duration"
  | "endOfDay"
  | "toDateOnlyKey"

const DURATION_FACTORS = new Set([24, 60, 1_000, 3_600, 86_400])
const DURATION_FACTORS_MINIMUM = 2
const END_OF_DAY_TIME = [23, 59, 59, 999]

const getNumberLiteralValue = (node: AstNode | undefined): number | null => {
  if (node == null || !isLiteral(node) || typeof node.value !== "number") {
    return null
  }
  return node.value
}

const getMethodName = (node: CallExpressionNode): string | null => {
  const { callee } = node
  if (!isMemberExpression(callee) || callee.computed || !isIdentifier(callee.property)) {
    return null
  }
  return callee.property.name
}

const getMethodReceiver = (node: CallExpressionNode): AstNode | null => {
  return isMemberExpression(node.callee) ? node.callee.object : null
}

const isMethodCall = (node: AstNode | null, methodName: string): node is CallExpressionNode => {
  return node != null && isCallExpression(node) && getMethodName(node) === methodName
}

const isMathCall = (node: AstNode, methodName: "max" | "min"): node is CallExpressionNode => {
  if (!isMethodCall(node, methodName)) {
    return false
  }
  const receiver = getMethodReceiver(node)
  return receiver != null && isIdentifier(receiver) && receiver.name === "Math"
}

const isFirstCharacter = (node: AstNode | null): boolean => {
  if (node == null) {
    return false
  }
  if (isMethodCall(node, "charAt")) {
    return getNumberLiteralValue(node.arguments[0]) === 0
  }
  return isMemberExpression(node) && node.computed && getNumberLiteralValue(node.property) === 0
}

const isMultiplication = (node: AstNode | null): node is BinaryExpressionNode => {
  return node != null && isBinaryExpression(node) && node.operator === "*"
}

const getMultiplicationFactors = (node: AstNode): AstNode[] => {
  if (isMultiplication(node)) {
    return [...getMultiplicationFactors(node.left), ...getMultiplicationFactors(node.right)]
  }
  return [node]
}

const getHasDurationFactors = (node: BinaryExpressionNode): boolean => {
  const durationFactors = getMultiplicationFactors(node).filter((factor) => {
    const value = getNumberLiteralValue(factor)
    return value != null && DURATION_FACTORS.has(value)
  })
  return durationFactors.length >= DURATION_FACTORS_MINIMUM
}

const getIsSetDeduplication = (node: AstNode): boolean => {
  const { parent } = node
  if (parent == null) {
    return false
  }
  if (isSpreadElement(parent)) {
    return (
      parent.parent != null &&
      isArrayExpression(parent.parent) &&
      parent.parent.elements.length === 1
    )
  }
  if (!isMethodCall(parent, "from") || parent.arguments.length !== 1) {
    return false
  }
  const receiver = getMethodReceiver(parent)
  return receiver != null && isIdentifier(receiver) && receiver.name === "Array"
}

const getIsEndOfDayTime = (node: CallExpressionNode): boolean => {
  return (
    node.arguments.length === END_OF_DAY_TIME.length &&
    END_OF_DAY_TIME.every((value, index) => {
      return getNumberLiteralValue(node.arguments[index]) === value
    })
  )
}

const getIsClamp = (node: CallExpressionNode): boolean => {
  const hasArgumentCalling = (methodName: "max" | "min"): boolean => {
    return node.arguments.some((argument) => {
      return isMathCall(argument, methodName)
    })
  }
  return (
    (isMathCall(node, "min") && hasArgumentCalling("max")) ||
    (isMathCall(node, "max") && hasArgumentCalling("min"))
  )
}

const getCallMessageId = (node: CallExpressionNode): PreferSharedUtilsMessageId | null => {
  const methodName = getMethodName(node)
  const receiver = getMethodReceiver(node)
  if (
    (methodName === "slice" || methodName === "substring" || methodName === "split") &&
    isMethodCall(receiver, "toISOString")
  ) {
    return "toDateOnlyKey"
  }
  if (methodName === "toUpperCase" && isFirstCharacter(receiver)) {
    return "capitalize"
  }
  if (methodName === "setHours" && getIsEndOfDayTime(node)) {
    return "endOfDay"
  }
  if (getIsClamp(node)) {
    return "clamp"
  }
  return null
}

export const preferSharedUtils: Rule<PreferSharedUtilsMessageId> = {
  meta: {
    type: "suggestion",
    docs: { description: "Shared helpers replace their hand-written equivalents." },
    messages: {
      capitalize: "Use `capitalize` from `@repo/utils/string`.",
      clamp: "Use `clamp` from `@repo/utils/math`.",
      deduplicate: "Use `deduplicate` from `@repo/utils/array`.",
      duration:
        "Derive the duration with `calculateMillisecondsFromDuration` or `calculateSecondsFromDuration` from `@repo/utils/date`, so the value carries its unit.",
      endOfDay: "Use `endOfDay` from `@repo/utils/date`.",
      toDateOnlyKey: "Use `toDateOnlyKey` from `@repo/utils/date`.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      NewExpression: (node) => {
        if (
          isIdentifier(node.callee) &&
          node.callee.name === "Set" &&
          getIsSetDeduplication(node)
        ) {
          context.report({ node, messageId: "deduplicate" })
        }
      },
      BinaryExpression: (node) => {
        if (
          isMultiplication(node) &&
          !isMultiplication(node.parent) &&
          getHasDurationFactors(node)
        ) {
          context.report({ node, messageId: "duration" })
        }
      },
      CallExpression: (node) => {
        const messageId = getCallMessageId(node)
        if (messageId != null) {
          context.report({ node, messageId })
        }
      },
    }
  },
}
