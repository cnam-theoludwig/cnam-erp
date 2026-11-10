import type { Rule } from "../types.ts"
import { isIdentifier } from "../types.ts"

export const noClassNameConstant: Rule<"inlineClassNames"> = {
  meta: {
    type: "suggestion",
    docs: { description: "Class lists stay inline at the element they style." },
    messages: {
      inlineClassNames:
        "Write the classes inline in `classNames(...)` at the point of use. When a class list repeats too much, extract a React component (variants as a prop), not a constant.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      VariableDeclarator: (node) => {
        if (isIdentifier(node.id) && /(^|_)CLASS_?NAMES?$/u.test(node.id.name)) {
          context.report({ node: node.id, messageId: "inlineClassNames" })
        }
      },
    }
  },
}
