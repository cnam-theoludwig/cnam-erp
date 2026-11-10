import type { I18nLocale } from "@repo/models/I18n"
import { createIsomorphicFn } from "@tanstack/react-start"
import type { Messages } from "use-intl"
import type { ImportI18nMessages } from "./i18n.ts"
import { importBundledI18nMessages } from "./i18n.ts"
import defaultMessages from "./translations/fr-FR.json"

const I18N_MESSAGES_URLS: Record<string, string> = import.meta.env.DEV
  ? {}
  : import.meta.glob<string>(["./translations/*.json", "!./translations/fr-FR.json"], {
      query: "?url",
      import: "default",
      eager: true,
    })

export const getI18nMessagesURL = (i18nLocale: I18nLocale): string | undefined => {
  return I18N_MESSAGES_URLS[`./translations/${i18nLocale}.json`]
}

export const importI18nMessages: ImportI18nMessages = createIsomorphicFn()
  .server(async (i18nLocale: I18nLocale): Promise<Messages> => {
    return await importBundledI18nMessages(i18nLocale)
  })
  .client(async (i18nLocale: I18nLocale): Promise<Messages> => {
    const i18nMessagesURL = getI18nMessagesURL(i18nLocale)
    if (i18nMessagesURL != null) {
      const response = await fetch(i18nMessagesURL)
      if (!response.ok) {
        throw new Error(`Failed to fetch the "${i18nLocale}" messages (HTTP ${response.status}).`)
      }
      return (await response.json()) as Messages
    }
    if (import.meta.env.DEV) {
      return await importBundledI18nMessages(i18nLocale)
    }
    return defaultMessages
  })
