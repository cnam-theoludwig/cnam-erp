import type { AstNode, Rule } from "../types.ts"
import { isIdentifier, isImportSpecifier } from "../types.ts"

const isRandomUuidName = (node: AstNode): boolean => {
  return isIdentifier(node) && node.name === "randomUUID"
}

export const noRandomUuid: Rule<"randomUUIDv7"> = {
  meta: {
    type: "problem",
    docs: { description: "UUIDs are version 7." },
    messages: {
      randomUUIDv7: "Use `crypto.randomUUIDv7()` (from `node:crypto`), not `randomUUID()`.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      MemberExpression: (node) => {
        if (isRandomUuidName(node.property)) {
          context.report({ node, messageId: "randomUUIDv7" })
        }
      },
      ImportDeclaration: (node) => {
        if (node.source.value !== "crypto" && node.source.value !== "node:crypto") {
          return
        }
        for (const specifier of node.specifiers) {
          if (isImportSpecifier(specifier) && isRandomUuidName(specifier.imported)) {
            context.report({ node: specifier, messageId: "randomUUIDv7" })
          }
        }
      },
    }
  },
}
