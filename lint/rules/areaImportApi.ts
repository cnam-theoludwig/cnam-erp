import path from "node:path"
import type { AstNode, LiteralNode, Rule } from "../types.ts"

const ROUTES_DIRECTORY = `${path.sep}src${path.sep}routes${path.sep}`

const getRouteArea = (filePath: string): string | null => {
  const routesDirectoryIndex = filePath.indexOf(ROUTES_DIRECTORY)
  if (routesDirectoryIndex === -1) {
    return null
  }
  const routeSegments = filePath
    .slice(routesDirectoryIndex + ROUTES_DIRECTORY.length)
    .split(path.sep)
  const isRoutesRootFile = routeSegments.length === 1
  if (isRoutesRootFile) {
    return null
  }
  return routeSegments[0] ?? null
}

export const areaImportApi: Rule<"routeArea"> = {
  meta: {
    type: "problem",
    docs: {
      description: "A route area never imports the files of another route area.",
    },
    messages: {
      routeArea:
        "`routes/{{importerRouteArea}}/` imports a file of `routes/{{importedRouteArea}}/`. Code used by 2 or more route areas moves up to `domain/<Entity>/`.",
    },
    schema: [],
  },
  create: (context) => {
    const checkSource = (node: AstNode, source: LiteralNode | null): void => {
      if (source == null || typeof source.value !== "string" || !source.value.startsWith(".")) {
        return
      }
      const importerRouteArea = getRouteArea(context.filename)
      const importedRouteArea = getRouteArea(
        path.resolve(path.dirname(context.filename), source.value),
      )
      if (
        importerRouteArea == null ||
        importedRouteArea == null ||
        importerRouteArea === importedRouteArea
      ) {
        return
      }
      context.report({
        node,
        messageId: "routeArea",
        data: { importerRouteArea, importedRouteArea },
      })
    }
    return {
      ImportDeclaration: (node) => {
        checkSource(node, node.source)
      },
      ExportNamedDeclaration: (node) => {
        checkSource(node, node.source)
      },
      ExportAllDeclaration: (node) => {
        checkSource(node, node.source)
      },
    }
  },
}
