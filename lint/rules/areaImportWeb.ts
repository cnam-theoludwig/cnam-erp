import path from "node:path"
import type { AstNode, LiteralNode, Rule } from "../types.ts"

const ROUTES_DIRECTORY = `${path.sep}src${path.sep}routes${path.sep}`
const ROLE_DASHBOARD_DIRECTORIES = new Set([
  "user",
  "user/admin",
  "user/advertiser",
  "user/content-creator",
])

const isNonRouteSegment = (segment: string): boolean => {
  return segment.startsWith("-")
}

const getRouteSegments = (filePath: string): string[] | null => {
  const routesDirectoryIndex = filePath.indexOf(ROUTES_DIRECTORY)
  if (routesDirectoryIndex === -1) {
    return null
  }
  return filePath.slice(routesDirectoryIndex + ROUTES_DIRECTORY.length).split(path.sep)
}

const toFeatureArea = (featureAreaDirectories: string[]): string => {
  return ["routes", ...featureAreaDirectories, ""].join("/")
}

const getFeatureArea = (routeSegments: string[]): string => {
  const featureAreaDirectories: string[] = []
  for (const directory of routeSegments.slice(0, -1)) {
    if (isNonRouteSegment(directory)) {
      break
    }
    featureAreaDirectories.push(directory)
    if (!ROLE_DASHBOARD_DIRECTORIES.has(featureAreaDirectories.join("/"))) {
      break
    }
  }
  return toFeatureArea(featureAreaDirectories)
}

export const areaImportWeb: Rule<"featureArea"> = {
  meta: {
    type: "problem",
    docs: {
      description: "A feature area never imports the non-route files of another feature area.",
    },
    messages: {
      featureArea:
        "`{{importerFeatureArea}}` imports a non-route file of `{{importedFeatureArea}}`. Code used by 2 or more feature areas moves up to `DataDisplay/<Entity>/`.",
    },
    schema: [],
  },
  create: (context) => {
    const checkSource = (node: AstNode, source: LiteralNode | null): void => {
      if (source == null || typeof source.value !== "string" || !source.value.startsWith(".")) {
        return
      }
      const importerSegments = getRouteSegments(context.filename)
      const importedSegments = getRouteSegments(
        path.resolve(path.dirname(context.filename), source.value),
      )
      if (
        importerSegments == null ||
        importedSegments == null ||
        !importedSegments.some((segment) => {
          return isNonRouteSegment(segment)
        })
      ) {
        return
      }
      const importerFeatureArea = getFeatureArea(importerSegments)
      const importedFeatureArea = getFeatureArea(importedSegments)
      if (importerFeatureArea !== importedFeatureArea) {
        context.report({
          node,
          messageId: "featureArea",
          data: { importerFeatureArea, importedFeatureArea },
        })
      }
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
