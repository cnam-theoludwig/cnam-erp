import type { AstNode, Rule, TypeReferenceNode } from "../types.ts"
import {
  isArrowFunctionExpression,
  isIdentifier,
  isQualifiedName,
  isTypeReference,
} from "../types.ts"

const isReactFCTypeName = (typeName: AstNode): boolean => {
  if (isIdentifier(typeName)) {
    return typeName.name === "FC"
  }
  return (
    isQualifiedName(typeName) &&
    isIdentifier(typeName.left) &&
    typeName.left.name === "React" &&
    typeName.right.name === "FC"
  )
}

const getReactFCType = (id: AstNode): TypeReferenceNode | null => {
  if (!isIdentifier(id) || id.typeAnnotation == null) {
    return null
  }
  const type = id.typeAnnotation.typeAnnotation
  if (!isTypeReference(type) || !isReactFCTypeName(type.typeName)) {
    return null
  }
  return type
}

export const reactFCProps: Rule<"namedPropsInterface" | "propsParameter"> = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "A `React.FC` component takes a named props interface and a parameter called `props`.",
    },
    messages: {
      namedPropsInterface:
        "Declare the props as a named interface (`interface FooProps`) instead of an inline type.",
      propsParameter:
        "Name the parameter `props` and destructure it in the body: `const { foo } = props`.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      VariableDeclarator: (node) => {
        const reactFCType = getReactFCType(node.id)
        if (reactFCType == null) {
          return
        }
        const propsType = reactFCType.typeArguments?.params[0]
        if (propsType?.type === "TSTypeLiteral") {
          context.report({ node: propsType, messageId: "namedPropsInterface" })
        }
        if (node.init == null || !isArrowFunctionExpression(node.init)) {
          return
        }
        const propsParameter = node.init.params[0]
        if (
          propsParameter != null &&
          !(isIdentifier(propsParameter) && propsParameter.name === "props")
        ) {
          context.report({ node: propsParameter, messageId: "propsParameter" })
        }
      },
    }
  },
}
