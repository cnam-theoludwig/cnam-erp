export interface AstNode {
  type: string
  parent: AstNode | null
}

export interface IdentifierNode extends AstNode {
  type: "Identifier"
  name: string
  typeAnnotation?: TypeAnnotationNode | null
}

export interface TypeAnnotationNode extends AstNode {
  type: "TSTypeAnnotation"
  typeAnnotation: AstNode
}

export interface QualifiedNameNode extends AstNode {
  type: "TSQualifiedName"
  left: AstNode
  right: IdentifierNode
}

export interface TypeReferenceNode extends AstNode {
  type: "TSTypeReference"
  typeName: AstNode
  typeArguments?: TypeArgumentsNode | null
}

export interface TypeQueryNode extends AstNode {
  type: "TSTypeQuery"
  exprName: AstNode
}

export interface TypeAliasDeclarationNode extends AstNode {
  type: "TSTypeAliasDeclaration"
  id: IdentifierNode
  typeAnnotation: AstNode
}

export interface LiteralNode extends AstNode {
  type: "Literal"
  value: unknown
}

export interface MemberExpressionNode extends AstNode {
  type: "MemberExpression"
  object: AstNode
  property: AstNode
  computed: boolean
}

export interface TypeArgumentsNode extends AstNode {
  type: "TSTypeParameterInstantiation"
  params: AstNode[]
}

export interface CallExpressionNode extends AstNode {
  type: "CallExpression"
  callee: AstNode
  arguments: AstNode[]
  typeArguments?: TypeArgumentsNode | null
}

export interface NewExpressionNode extends AstNode {
  type: "NewExpression"
  callee: AstNode
  arguments: AstNode[]
}

export interface ArrayExpressionNode extends AstNode {
  type: "ArrayExpression"
  elements: Array<AstNode | null>
}

export interface SpreadElementNode extends AstNode {
  type: "SpreadElement"
  argument: AstNode
}

export interface BinaryExpressionNode extends AstNode {
  type: "BinaryExpression"
  operator: string
  left: AstNode
  right: AstNode
}

export interface ArrowFunctionExpressionNode extends AstNode {
  type: "ArrowFunctionExpression"
  params: AstNode[]
  body: AstNode
}

export interface FunctionDeclarationNode extends AstNode {
  type: "FunctionDeclaration"
  id: IdentifierNode | null
}

export interface VariableDeclaratorNode extends AstNode {
  type: "VariableDeclarator"
  id: AstNode
  init: AstNode | null
}

export interface JSXIdentifierNode extends AstNode {
  type: "JSXIdentifier"
  name: string
}

export interface JSXAttributeNode extends AstNode {
  type: "JSXAttribute"
  name: AstNode
  value: AstNode | null
}

export interface JSXExpressionContainerNode extends AstNode {
  type: "JSXExpressionContainer"
  expression: AstNode
}

export interface JSXOpeningElementNode extends AstNode {
  type: "JSXOpeningElement"
  name: AstNode
  attributes: AstNode[]
}

export interface PropertySignatureNode extends AstNode {
  type: "TSPropertySignature"
  key: AstNode
  typeAnnotation?: TypeAnnotationNode | null
}

export interface UnionTypeNode extends AstNode {
  type: "TSUnionType"
  types: AstNode[]
}

export interface ArrayTypeNode extends AstNode {
  type: "TSArrayType"
  elementType: AstNode
}

export interface ImportSpecifierNode extends AstNode {
  type: "ImportSpecifier"
  imported: AstNode
}

export interface ImportDeclarationNode extends AstNode {
  type: "ImportDeclaration"
  source: LiteralNode
  specifiers: AstNode[]
}

export interface ExportNamedDeclarationNode extends AstNode {
  type: "ExportNamedDeclaration"
  source: LiteralNode | null
}

export interface ExportAllDeclarationNode extends AstNode {
  type: "ExportAllDeclaration"
  source: LiteralNode
}

interface AstNodeByType {
  BinaryExpression: BinaryExpressionNode
  CallExpression: CallExpressionNode
  ExportAllDeclaration: ExportAllDeclarationNode
  ExportNamedDeclaration: ExportNamedDeclarationNode
  ImportDeclaration: ImportDeclarationNode
  MemberExpression: MemberExpressionNode
  NewExpression: NewExpressionNode
  Identifier: IdentifierNode
  JSXAttribute: JSXAttributeNode
  JSXOpeningElement: JSXOpeningElementNode
  TSPropertySignature: PropertySignatureNode
  TSTypeAliasDeclaration: TypeAliasDeclarationNode
  VariableDeclarator: VariableDeclaratorNode
}

export type RuleVisitor = {
  [Type in keyof AstNodeByType]?: (node: AstNodeByType[Type]) => void
} & {
  "Program:exit"?: () => void
}

export interface RuleContext<MessageId extends string> {
  filename: string
  report: (descriptor: {
    node: AstNode
    messageId: MessageId
    data?: Record<string, string>
  }) => void
}

export interface Rule<MessageId extends string> {
  meta: {
    type: "problem" | "suggestion"
    docs: { description: string }
    messages: Record<MessageId, string>
    schema: []
  }
  create: (context: RuleContext<MessageId>) => RuleVisitor
}

export const isIdentifier = (node: AstNode): node is IdentifierNode => {
  return node.type === "Identifier"
}

export const isLiteral = (node: AstNode): node is LiteralNode => {
  return node.type === "Literal"
}

export const isCallExpression = (node: AstNode): node is CallExpressionNode => {
  return node.type === "CallExpression"
}

export const isBinaryExpression = (node: AstNode): node is BinaryExpressionNode => {
  return node.type === "BinaryExpression"
}

export const isArrayExpression = (node: AstNode): node is ArrayExpressionNode => {
  return node.type === "ArrayExpression"
}

export const isSpreadElement = (node: AstNode): node is SpreadElementNode => {
  return node.type === "SpreadElement"
}

export const isMemberExpression = (node: AstNode): node is MemberExpressionNode => {
  return node.type === "MemberExpression"
}

export const isQualifiedName = (node: AstNode): node is QualifiedNameNode => {
  return node.type === "TSQualifiedName"
}

export const isTypeReference = (node: AstNode): node is TypeReferenceNode => {
  return node.type === "TSTypeReference"
}

export const isTypeQuery = (node: AstNode): node is TypeQueryNode => {
  return node.type === "TSTypeQuery"
}

export const isArrowFunctionExpression = (node: AstNode): node is ArrowFunctionExpressionNode => {
  return node.type === "ArrowFunctionExpression"
}

export const isJSXIdentifier = (node: AstNode): node is JSXIdentifierNode => {
  return node.type === "JSXIdentifier"
}

export const isFunctionDeclaration = (node: AstNode): node is FunctionDeclarationNode => {
  return node.type === "FunctionDeclaration"
}

export const isFunctionExpression = (node: AstNode): boolean => {
  return node.type === "FunctionExpression"
}

export const isVariableDeclarator = (node: AstNode): node is VariableDeclaratorNode => {
  return node.type === "VariableDeclarator"
}

export const isJSXExpressionContainer = (node: AstNode): node is JSXExpressionContainerNode => {
  return node.type === "JSXExpressionContainer"
}

export const isJSXAttribute = (node: AstNode): node is JSXAttributeNode => {
  return node.type === "JSXAttribute"
}

export const isUnionType = (node: AstNode): node is UnionTypeNode => {
  return node.type === "TSUnionType"
}

export const isArrayType = (node: AstNode): node is ArrayTypeNode => {
  return node.type === "TSArrayType"
}

export const isImportSpecifier = (node: AstNode): node is ImportSpecifierNode => {
  return node.type === "ImportSpecifier"
}
