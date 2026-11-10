import { createTanstackQueryUtils } from "@orpc/tanstack-query"
import { apiClient } from "@repo/api-client"
import { NAME, THEME_COLOR } from "@repo/utils/configuration"
import { cn } from "cn"

export const apiClientQuery = createTanstackQueryUtils(apiClient)

export const classNames = cn

export interface SeoInput {
  title: string
  description: string
}
export type SeoOutput = Array<React.JSX.IntrinsicElements["meta"]>

export const seo = (input: SeoInput): SeoOutput => {
  const { title, description } = input
  return [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "color-scheme", content: "light" },
    { name: "theme-color", content: THEME_COLOR },
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:site_name", content: NAME },
    { name: "robots", content: "noindex, nofollow" },
  ]
}
