import type { I18nLocale } from "@repo/models/I18n"
import {
  I18N_LOCALE_DEFAULT,
  TIMEZONE_DEFAULT,
  hasI18nLocale,
  hasTimezone,
} from "@repo/models/I18n"
import { deepMerge } from "@repo/utils/object"
import type { OmitStrict } from "@repo/utils/type"
import type { IntlConfig, Messages } from "use-intl"
import { createTranslator } from "use-intl"
import defaultMessages from "./translations/fr-FR.json"

export type I18nConfig = OmitStrict<IntlConfig, "getMessageFallback" | "onError" | "messages">

export type IntlConfigSerializable = I18nConfig & {
  messages: Messages
}

const INTL_FORMATS: I18nConfig["formats"] = {
  dateTime: {
    short: { hourCycle: "h23" },
    medium: { hourCycle: "h23" },
    long: { hourCycle: "h23" },
    full: { hourCycle: "h23" },
  },
}

export interface I18nState extends I18nConfig {
  timezoneAutoDetected: boolean
}

export const I18N_STATE_FALLBACK: I18nState = {
  locale: I18N_LOCALE_DEFAULT,
  timeZone: TIMEZONE_DEFAULT,
  formats: INTL_FORMATS,
  timezoneAutoDetected: true,
}

export type ImportI18nMessages = (i18nLocale: I18nLocale) => Promise<Messages>

export const importBundledI18nMessages: ImportI18nMessages = async (i18nLocale) => {
  const i18nMessagesModule: { default: Messages } = await import(
    `./translations/${i18nLocale}.json`
  )
  return i18nMessagesModule.default
}

const i18nMessagesByLocale = new Map<I18nLocale, Messages>([[I18N_LOCALE_DEFAULT, defaultMessages]])

export const loadI18nMessages = async (
  i18nLocale: I18nLocale,
  importI18nMessages: ImportI18nMessages,
): Promise<void> => {
  if (i18nMessagesByLocale.has(i18nLocale)) {
    return
  }
  try {
    const userMessages = await importI18nMessages(i18nLocale)
    i18nMessagesByLocale.set(i18nLocale, deepMerge(defaultMessages, userMessages))
  } catch (error) {
    console.error(error)
  }
}

export const withI18nMessages = (i18nConfig: I18nConfig): IntlConfigSerializable => {
  return {
    ...i18nConfig,
    messages: i18nMessagesByLocale.get(i18nConfig.locale) ?? defaultMessages,
  }
}

export const createI18nTranslator = (
  i18nConfig: I18nConfig,
): ReturnType<typeof createTranslator<Messages>> => {
  return createTranslator(withI18nMessages(i18nConfig))
}

export const getI18nConfig = (
  i18nLocaleRaw?: string | null,
  timezone?: string | null,
): I18nConfig => {
  return {
    locale:
      i18nLocaleRaw != null && hasI18nLocale(i18nLocaleRaw) ? i18nLocaleRaw : I18N_LOCALE_DEFAULT,
    timeZone: timezone != null && hasTimezone(timezone) ? timezone : TIMEZONE_DEFAULT,
    formats: INTL_FORMATS,
  }
}

export const getIntlConfig = async (
  i18nLocaleRaw?: string | null,
  timezone?: string | null,
): Promise<IntlConfigSerializable> => {
  const i18nConfig = getI18nConfig(i18nLocaleRaw, timezone)
  await loadI18nMessages(i18nConfig.locale, importBundledI18nMessages)
  return withI18nMessages(i18nConfig)
}
