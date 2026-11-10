import { WEB_URL } from "@repo/utils/configuration"
import * as z from "zod"
import { UserZod } from "./AuthUser.ts"
import { DurationUnitZod, EmailZod, EntityZod, WebURLZod } from "./Entity.ts"
import { I18nLocaleZod, TimezoneZod } from "./I18n.ts"

export const EmailInputBaseZodObject = z.object({
  i18nLocale: I18nLocaleZod,
  timezone: TimezoneZod,
  webURL: WebURLZod,
})
export type EmailInputBase = z.infer<typeof EmailInputBaseZodObject>

interface EmailRecipient {
  i18nLocale: EmailInputBase["i18nLocale"]
  timezone: EmailInputBase["timezone"]
}

export const emailBase = (recipient: EmailRecipient): EmailInputBase => {
  return {
    i18nLocale: recipient.i18nLocale,
    timezone: recipient.timezone,
    webURL: WEB_URL,
  }
}

export const EMAILS_INPUTS = {
  AuthEmailVerify: EmailInputBaseZodObject.extend({
    apiURL: WebURLZod,
    email: EmailZod,
    temporaryToken: EntityZod.id,
    temporaryTokenExpirationDate: z.coerce.date<Date>(),
  }),
  AuthPasswordReset: EmailInputBaseZodObject.extend({
    userDisplayName: UserZod.displayName,
    temporaryToken: EntityZod.id,
    temporaryTokenExpirationDate: z.coerce.date<Date>(),
    durationAmount: z.coerce.number<number>().int().positive(),
    durationUnit: DurationUnitZod,
  }),
  AuthEmailUpdateWarning: EmailInputBaseZodObject.extend({
    emailOld: EmailZod,
    emailPending: EmailZod,
  }),
}
export type Emails = typeof EMAILS_INPUTS

export type EmailType = keyof Emails

export const EmailSendZodObject = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("AuthEmailVerify"),
    input: EMAILS_INPUTS.AuthEmailVerify,
  }),
  z.object({
    type: z.literal("AuthPasswordReset"),
    input: EMAILS_INPUTS.AuthPasswordReset,
  }),
  z.object({
    type: z.literal("AuthEmailUpdateWarning"),
    input: EMAILS_INPUTS.AuthEmailUpdateWarning,
  }),
])
export type EmailSend = z.infer<typeof EmailSendZodObject>

export const EmailInputZodObject = z
  .object({
    toEmail: EmailZod,
    userId: UserZod.id,
  })
  .and(EmailSendZodObject)
export type EmailInput = z.infer<typeof EmailInputZodObject>

export interface EmailOutput {
  html: string
  plainText: string
  subject: string
}
