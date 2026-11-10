import type { AstNode, Rule, TypeAnnotationNode } from "../types.ts"
import { isArrayType, isIdentifier, isMemberExpression, isUnionType } from "../types.ts"

const isNullishType = (type: AstNode): boolean => {
  return type.type === "TSNullKeyword" || type.type === "TSUndefinedKeyword"
}

const isNullableStringType = (type: AstNode): boolean => {
  if (type.type === "TSStringKeyword") {
    return true
  }
  return (
    isUnionType(type) &&
    type.types.some((member) => {
      return member.type === "TSStringKeyword"
    }) &&
    type.types.every((member) => {
      return member.type === "TSStringKeyword" || isNullishType(member)
    })
  )
}

const isStringIdType = (name: string, typeAnnotation: TypeAnnotationNode): boolean => {
  const type = typeAnnotation.typeAnnotation
  if (name.endsWith("Id")) {
    return isNullableStringType(type)
  }
  if (name.endsWith("Ids")) {
    return isArrayType(type) && type.elementType.type === "TSStringKeyword"
  }
  return false
}

const isZodUuidCallee = (callee: AstNode): boolean => {
  return (
    isMemberExpression(callee) &&
    isIdentifier(callee.object) &&
    callee.object.name === "z" &&
    isIdentifier(callee.property) &&
    callee.property.name === "uuid"
  )
}

export const entityIdReference: Rule<"entityIdType" | "entityIdZod"> = {
  meta: {
    type: "suggestion",
    docs: { description: "Ids reference the type or the schema of their entity." },
    messages: {
      entityIdType:
        'Reference the type of the id instead of `string` (`orderId: Order["id"]`). Relationships stay explicit and survive refactors.',
      entityIdZod:
        "Reference the entity schema (`orderId: OrderZod.id`), not `z.uuid()`. Relationships stay explicit and survive refactors.",
    },
    schema: [],
  },
  create: (context) => {
    return {
      TSPropertySignature: (node) => {
        if (
          isIdentifier(node.key) &&
          node.typeAnnotation != null &&
          isStringIdType(node.key.name, node.typeAnnotation)
        ) {
          context.report({ node, messageId: "entityIdType" })
        }
      },
      Identifier: (node) => {
        if (node.typeAnnotation != null && isStringIdType(node.name, node.typeAnnotation)) {
          context.report({ node, messageId: "entityIdType" })
        }
      },
      CallExpression: (node) => {
        if (isZodUuidCallee(node.callee)) {
          context.report({ node, messageId: "entityIdZod" })
        }
      },
    }
  },
}
