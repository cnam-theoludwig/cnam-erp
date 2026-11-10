import type { AstNode, Rule } from "../types.ts"
import {
  isArrowFunctionExpression,
  isCallExpression,
  isFunctionDeclaration,
  isFunctionExpression,
  isIdentifier,
  isJSXAttribute,
  isJSXExpressionContainer,
  isJSXIdentifier,
  isMemberExpression,
  isVariableDeclarator,
} from "../types.ts"

type Owner =
  | { type: "handleAsync" }
  | { type: "eventHandler" }
  | { type: "function"; name: string }
  | { type: "unknown" }

interface FunctionUsage {
  isMutating: boolean
  calleeNames: Set<string>
}

interface EventHandlerReference {
  node: AstNode
  name: string
}

const getCalleeName = (callee: AstNode): string | null => {
  if (isIdentifier(callee)) {
    return callee.name
  }
  if (isMemberExpression(callee) && isIdentifier(callee.property)) {
    return callee.property.name
  }
  return null
}

const isMutationCallee = (callee: AstNode): boolean => {
  const calleeName = getCalleeName(callee)
  return isMemberExpression(callee) && (calleeName === "mutate" || calleeName === "mutateAsync")
}

const isEventHandlerAttribute = (node: AstNode): boolean => {
  return isJSXAttribute(node) && isJSXIdentifier(node.name) && /^on[A-Z]/u.test(node.name.name)
}

const getVariableName = (node: AstNode | null): string | null => {
  if (node != null && isVariableDeclarator(node) && isIdentifier(node.id)) {
    return node.id.name
  }
  return null
}

const getFunctionName = (node: AstNode): string | null => {
  if (isFunctionDeclaration(node)) {
    return node.id?.name ?? null
  }
  if (!isArrowFunctionExpression(node) && !isFunctionExpression(node)) {
    return null
  }
  const { parent } = node
  if (
    parent != null &&
    isCallExpression(parent) &&
    getCalleeName(parent.callee) === "useCallback" &&
    parent.arguments[0] === node
  ) {
    return getVariableName(parent.parent)
  }
  return getVariableName(parent)
}

const isCallArgument = (node: AstNode): boolean => {
  const { parent } = node
  return parent != null && isCallExpression(parent) && parent.arguments.includes(node)
}

const isCallbackHandedOff = (node: AstNode): boolean => {
  if (!isArrowFunctionExpression(node) && !isFunctionExpression(node)) {
    return false
  }
  if (isCallArgument(node)) {
    return true
  }
  const property = node.parent
  const object = property?.parent
  return (
    property?.type === "Property" && object?.type === "ObjectExpression" && isCallArgument(object)
  )
}

const getOwner = (node: AstNode): Owner => {
  for (let ancestor = node.parent; ancestor != null; ancestor = ancestor.parent) {
    if (isCallExpression(ancestor) && getCalleeName(ancestor.callee) === "handleAsync") {
      return { type: "handleAsync" }
    }
    if (isEventHandlerAttribute(ancestor)) {
      return { type: "eventHandler" }
    }
    const functionName = getFunctionName(ancestor)
    if (functionName != null) {
      return { type: "function", name: functionName }
    }
    if (isCallbackHandedOff(ancestor)) {
      return { type: "unknown" }
    }
  }
  return { type: "unknown" }
}

const getMutatingFunctionNames = (functionUsageByName: Map<string, FunctionUsage>): Set<string> => {
  const mutatingFunctionNames = new Set<string>()
  for (const [name, usage] of functionUsageByName) {
    if (usage.isMutating) {
      mutatingFunctionNames.add(name)
    }
  }
  let hasChanged = true
  while (hasChanged) {
    hasChanged = false
    for (const [name, usage] of functionUsageByName) {
      const callsMutatingFunction = [...usage.calleeNames].some((calleeName) => {
        return mutatingFunctionNames.has(calleeName)
      })
      if (!mutatingFunctionNames.has(name) && callsMutatingFunction) {
        mutatingFunctionNames.add(name)
        hasChanged = true
      }
    }
  }
  return mutatingFunctionNames
}

export const mutationAsyncHandler: Rule<"useAsyncHandler" | "eventHandlerReachesMutation"> = {
  meta: {
    type: "problem",
    docs: { description: "Every user-facing mutation goes through `useAsyncHandler()`." },
    messages: {
      useAsyncHandler:
        "Call the mutation inside `handleAsync({ handle })` from `useAsyncHandler()`. It wires the loading, success and error toast.",
      eventHandlerReachesMutation:
        "`{{name}}` calls a mutation outside `handleAsync({ handle })`. Wrap the mutation with `useAsyncHandler()`, it wires the loading, success and error toast.",
    },
    schema: [],
  },
  create: (context) => {
    const functionUsageByName = new Map<string, FunctionUsage>()
    const eventHandlerReferences: EventHandlerReference[] = []

    const getFunctionUsage = (name: string): FunctionUsage => {
      const existingUsage = functionUsageByName.get(name)
      if (existingUsage != null) {
        return existingUsage
      }
      const usage: FunctionUsage = { isMutating: false, calleeNames: new Set() }
      functionUsageByName.set(name, usage)
      return usage
    }

    return {
      CallExpression: (node) => {
        const isMutation = isMutationCallee(node.callee)
        const calledFunctionName = isIdentifier(node.callee) ? node.callee.name : null
        if (!isMutation && calledFunctionName == null) {
          return
        }
        const owner = getOwner(node)
        if (owner.type === "eventHandler") {
          if (isMutation) {
            context.report({ node, messageId: "useAsyncHandler" })
          } else if (calledFunctionName != null) {
            eventHandlerReferences.push({ node, name: calledFunctionName })
          }
        }
        if (owner.type === "function") {
          const usage = getFunctionUsage(owner.name)
          if (isMutation) {
            usage.isMutating = true
          } else if (calledFunctionName != null) {
            usage.calleeNames.add(calledFunctionName)
          }
        }
      },
      JSXAttribute: (node) => {
        if (
          isEventHandlerAttribute(node) &&
          node.value != null &&
          isJSXExpressionContainer(node.value) &&
          isIdentifier(node.value.expression)
        ) {
          eventHandlerReferences.push({ node: node.value, name: node.value.expression.name })
        }
      },
      "Program:exit": () => {
        const mutatingFunctionNames = getMutatingFunctionNames(functionUsageByName)
        for (const reference of eventHandlerReferences) {
          if (mutatingFunctionNames.has(reference.name)) {
            context.report({
              node: reference.node,
              messageId: "eventHandlerReachesMutation",
              data: { name: reference.name },
            })
          }
        }
      },
    }
  },
}
