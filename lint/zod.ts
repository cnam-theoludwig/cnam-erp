import type { AstNode } from "./types.ts"
import { isIdentifier, isQualifiedName, isTypeQuery, isTypeReference } from "./types.ts"

const ZOD_TYPE_HELPERS = new Set(["infer", "input", "output"])

export const getInferredSchemaName = (type: AstNode): string | null => {
  if (
    !isTypeReference(type) ||
    !isQualifiedName(type.typeName) ||
    !isIdentifier(type.typeName.left) ||
    type.typeName.left.name !== "z" ||
    !ZOD_TYPE_HELPERS.has(type.typeName.right.name)
  ) {
    return null
  }
  const schema = type.typeArguments?.params[0]
  if (schema == null || !isTypeQuery(schema) || !isIdentifier(schema.exprName)) {
    return null
  }
  return schema.exprName.name
}
