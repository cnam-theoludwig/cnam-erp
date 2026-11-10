import { DURATION_UNITS } from "@repo/utils/date"
import * as z from "zod"

export const DurationUnitZod = z.enum(DURATION_UNITS)

export const EntityZod = {
  id: z.uuid().toLowerCase(),
}
export const EntityZodObject = z.object(EntityZod)
export type Entity = z.infer<typeof EntityZodObject>

export const EMAIL_MAX_LENGTH = 255
export const EmailZod = z.email().trim().max(EMAIL_MAX_LENGTH).toLowerCase()
export type Email = z.infer<typeof EmailZod>

export const WEB_URL_MAX_LENGTH = 10_000

const normalizeWebURL = (url: string): string => {
  const normalizedURL = URL.parse(url)?.href ?? url
  const isTrailingSlashAdded = normalizedURL.endsWith("/") && !url.endsWith("/")
  if (isTrailingSlashAdded) {
    return normalizedURL.slice(0, -1)
  }
  return normalizedURL
}

/**
 * @see https://zod.dev/api?id=urls
 */
export const WebURLZod = z
  .url({
    protocol: /^https?$/u,
  })
  .trim()
  .overwrite(normalizeWebURL)
  .max(WEB_URL_MAX_LENGTH)
export type WebURL = z.infer<typeof WebURLZod>

export const getDefaultCatchZod = <T extends z.ZodType>(
  schema: T,
  defaultValue: Exclude<z.output<T>, undefined>,
): z.ZodCatch<z.ZodDefault<T>> => {
  return schema.default(defaultValue).catch(defaultValue)
}
