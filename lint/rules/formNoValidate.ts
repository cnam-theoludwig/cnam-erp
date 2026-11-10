import type { AstNode, Rule } from "../types.ts"
import { isJSXAttribute, isJSXIdentifier } from "../types.ts"

const isNoValidateAttribute = (attribute: AstNode): boolean => {
  return (
    isJSXAttribute(attribute) &&
    isJSXIdentifier(attribute.name) &&
    attribute.name.name === "noValidate"
  )
}

export const formNoValidate: Rule<"noValidate"> = {
  meta: {
    type: "problem",
    docs: { description: "Every `<form>` has `noValidate`." },
    messages: {
      noValidate:
        "Add `noValidate` to the `<form>`. Validation goes through `useFormZodI18n`, not the browser.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      JSXOpeningElement: (node) => {
        if (!isJSXIdentifier(node.name) || node.name.name !== "form") {
          return
        }
        if (!node.attributes.some(isNoValidateAttribute)) {
          context.report({ node, messageId: "noValidate" })
        }
      },
    }
  },
}
