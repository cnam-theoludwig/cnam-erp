import type { Duration } from "@repo/utils/date"
import { calculateSecondsFromDuration } from "@repo/utils/date"
import * as z from "zod"

const process = globalThis.process ?? { env: {} }

export const I18N_LOCALES = ["en-GB", "fr-FR"] as const
export type I18nLocale = (typeof I18N_LOCALES)[number]
export const I18N_LOCALE_DEFAULT = "fr-FR" satisfies I18nLocale
export const I18nLocaleZod = z.enum(I18N_LOCALES)

export const hasI18nLocale = (locale: string): locale is I18nLocale => {
  return I18N_LOCALES.includes(locale)
}

export const I18N_LOCALE_LABELS: {
  [key in I18nLocale]: string
} = {
  "en-GB": "English",
  "fr-FR": "Français",
}

export const I18N_LOCALE_COOKIE_DURATION: Duration = { amount: 1, unit: "year" }
export const I18N_LOCALE_COOKIE_MAX_AGE_SECONDS = calculateSecondsFromDuration({
  duration: I18N_LOCALE_COOKIE_DURATION,
})
export const I18N_LOCALE_COOKIE_NAME = "I18N_LOCALE"

export const TIMEZONES = Intl.supportedValuesOf("timeZone")
export type Timezone = (typeof TIMEZONES)[number]
export const TIMEZONE_DEFAULT = process.env["TZ"] ?? "Europe/Paris"
const TIMEZONES_SET = new Set(TIMEZONES)

/**
 * The list of supported timezones omits renamed ones (`Asia/Saigon` is now `Asia/Ho_Chi_Minh`), yet browsers still report their legacy name and date formatters still accept it.
 */
const isTimezoneResolvedAsItself = (value: string): boolean => {
  try {
    const resolvedTimezone = new Intl.DateTimeFormat("en", { timeZone: value }).resolvedOptions()
      .timeZone
    return resolvedTimezone === value
  } catch {
    return false
  }
}

export const hasTimezone = (value: string): boolean => {
  return TIMEZONES_SET.has(value) || isTimezoneResolvedAsItself(value)
}
export const TimezoneZod = z.string().refine(
  (value): value is Timezone => {
    return hasTimezone(value)
  },
  { message: "Invalid timezone" },
)

export const getTimezoneLabel = (timezone: string): string => {
  return timezone.replaceAll("_", " ")
}

export const TIMEZONE_COOKIE_DURATION: Duration = { amount: 1, unit: "year" }
export const TIMEZONE_COOKIE_MAX_AGE_SECONDS = calculateSecondsFromDuration({
  duration: TIMEZONE_COOKIE_DURATION,
})
export const TIMEZONE_COOKIE_NAME = "TIMEZONE"
export const TIMEZONE_AUTO_DETECTED_COOKIE_NAME = "TIMEZONE_AUTO_DETECTED"

/**
 * Every persisted amount is stored in integer minor units (cents) next to its currency.
 */
export const CURRENCIES = ["EUR"] as const
export type Currency = (typeof CURRENCIES)[number]
export const CurrencyZod = z.enum(CURRENCIES)
export const CURRENCY_DEFAULT = "EUR" satisfies Currency

/**
 * Number of decimal places in a currency's minor unit, per ISO 4217.
 *
 * `satisfies Record<Currency, number>`: adding a currency without its exponent is a compile error rather than a silent 100x mispricing (`JPY` is zero-decimal, `KWD` three-decimal).
 */
export const CURRENCY_MINOR_UNIT_EXPONENT = {
  EUR: 2,
} satisfies Record<Currency, number>

export const priceConverter = {
  centsToMajorUnit: (cents: number, currency: Currency): number => {
    return cents / 10 ** CURRENCY_MINOR_UNIT_EXPONENT[currency]
  },
  majorUnitToCents: (majorUnit: number, currency: Currency): number => {
    return Math.round(majorUnit * 10 ** CURRENCY_MINOR_UNIT_EXPONENT[currency])
  },
}

export const PriceZod = {
  cents: z.coerce.number<number>().int(),
  currency: CurrencyZod,
}
export const PriceZodObject = z.object(PriceZod)
export type Price = z.infer<typeof PriceZodObject>
