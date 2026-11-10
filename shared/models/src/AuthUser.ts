import { API_KEY_HEADER_NAME } from "@repo/utils/configuration"
import type { Duration } from "@repo/utils/date"
import { calculateSecondsFromDuration } from "@repo/utils/date"
import { capitalize } from "@repo/utils/string"
import * as z from "zod"
import { EmailZod, EntityZod } from "./Entity.ts"
import { I18nLocaleZod, TimezoneZod } from "./I18n.ts"

export const ROUTE_AUTH_WEB_CALLBACK = "/api/auth/callback"
export const ROUTE_AUTH_WEB_SIGN_IN = "/auth/sign-in"
export const ROUTE_AUTH_WEB_USER = "/user"

/**
 * The JWT algorithm used for signing authentication tokens.
 */
export const JWT_ALG = "HS256"

export const AUTH_COOKIE_DURATION: Duration = { amount: 1, unit: "year" }
export const AUTH_COOKIE_MAX_AGE_SECONDS = calculateSecondsFromDuration({
  duration: AUTH_COOKIE_DURATION,
})
export const AUTH_COOKIE_NAME = "authToken"
export const AUTH_TOKEN_TYPE = "Bearer"

export const AUTH_PROVIDER_CLASSIC = "classic" as const

export const AUTH_PROVIDERS = [AUTH_PROVIDER_CLASSIC] as const
export type AuthProvider = (typeof AUTH_PROVIDERS)[number]
export const AuthProviderZod = z.enum(AUTH_PROVIDERS)

export const EMAIL_VERIFICATION_TOKEN_DURATION = {
  amount: 1,
  unit: "hour",
} as const satisfies Duration
export const PASSWORD_RESET_TOKEN_DURATION = {
  amount: 1,
  unit: "hour",
} as const satisfies Duration

export const PASSWORD_MIN_LENGTH = 2
export const PASSWORD_MAX_LENGTH = 64
export const PasswordZod = z.coerce
  .string<string>()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH)

export const AuthAuthorizationZod = z.templateLiteral([
  `${AUTH_TOKEN_TYPE} `,
  z.jwt({ alg: JWT_ALG }),
])
export type AuthAuthorization = z.infer<typeof AuthAuthorizationZod>

export const AuthHeadersZodObject = z.object({
  authorization: AuthAuthorizationZod.nullish(),
})
export type AuthHeaders = z.infer<typeof AuthHeadersZodObject>

export const APIKeyHeadersZodObject = z.object({
  [API_KEY_HEADER_NAME]: z.coerce.string<string>().nullish(),
})
export type APIKeyHeaders = z.infer<typeof APIKeyHeadersZodObject>

export const USER_DISPLAY_NAME_MIN_LENGTH = 2
export const USER_DISPLAY_NAME_MAX_LENGTH = 50

export const UserZod = {
  id: EntityZod.id,
  displayName: z.coerce
    .string<string>()
    .trim()
    .min(USER_DISPLAY_NAME_MIN_LENGTH)
    .max(USER_DISPLAY_NAME_MAX_LENGTH)
    .transform((value) => {
      return capitalize(value)
    }),
  email: z
    .union([
      z.literal("").transform(() => {
        return null
      }),
      EmailZod,
    ])
    .nullish(),
  emailPending: z
    .union([
      z.literal("").transform(() => {
        return null
      }),
      EmailZod,
    ])
    .nullish(),
  temporaryToken: EntityZod.id.nullish(),
  temporaryTokenExpirationDate: z.coerce.date<Date>().nullish(),
  i18nLocale: I18nLocaleZod,
  timezone: TimezoneZod,
  timezoneAutoDetected: z.coerce.boolean<boolean>(),
  createdAt: z.coerce.date<Date>(),
}
export const UserZodObject = z.object(UserZod)
export type User = z.infer<typeof UserZodObject>

export const UserInfoZodObject = z.object({
  id: UserZod.id,
  displayName: UserZod.displayName,
  email: UserZod.email,
  emailPending: UserZod.emailPending,
  i18nLocale: UserZod.i18nLocale,
  timezone: UserZod.timezone,
  timezoneAutoDetected: UserZod.timezoneAutoDetected,
  createdAt: UserZod.createdAt,
})
export type UserInfo = z.infer<typeof UserInfoZodObject>

export const UserAccountZod = {
  id: EntityZod.id,
  userId: UserZod.id,
  provider: AuthProviderZod,
  providerAccountId: z.coerce.string<string>().min(1),
  information: z.coerce.string<string>().min(1),
}
export const UserAccountZodObject = z.object(UserAccountZod)
export type UserAccount = z.infer<typeof UserAccountZodObject>

export const AUTH_JWT_PURPOSE = "session"
export const AuthJWTZodObject = z.object({
  purpose: z.literal(AUTH_JWT_PURPOSE),
  provider: AuthProviderZod,
  userId: UserZod.id,
  sessionId: EntityZod.id,
})
export type AuthJWT = z.infer<typeof AuthJWTZodObject>

export const AuthStateZodObject = z.object({
  authJWT: AuthJWTZodObject,
  authorization: AuthAuthorizationZod,
  user: UserInfoZodObject,
})
export type AuthState = z.infer<typeof AuthStateZodObject>

const CALLBACK_PLACEHOLDER_ORIGIN = "https://placeholder.invalid"
export const CallbackZodBasic = z
  .string()
  .trim()
  .min(1)
  .refine((value) => {
    if (!value.startsWith("/")) {
      return false
    }
    if (value.includes("/../") || value.endsWith("/..")) {
      return false
    }
    if (value.includes("//") || /[\r\n\t]|%2f|%5c/iu.test(value)) {
      return false
    }
    try {
      const parsed = new URL(value, CALLBACK_PLACEHOLDER_ORIGIN)
      return parsed.origin === CALLBACK_PLACEHOLDER_ORIGIN
    } catch {
      return false
    }
  })
export const CallbackZod = CallbackZodBasic.nullish()
export type Callback = z.infer<typeof CallbackZod>

export const UserSignInClassicZodObject = z.object({
  email: EmailZod,
  password: PasswordZod,
  callback: CallbackZod,
  i18nLocale: I18nLocaleZod,
  timezone: TimezoneZod,
})
export type UserSignInClassic = z.infer<typeof UserSignInClassicZodObject>

export const ClassicSignInResponseZodObject = z.object({
  redirectURL: z.url(),
})
export type ClassicSignInResponse = z.infer<typeof ClassicSignInResponseZodObject>

export const PasswordForgotZodObject = z.object({
  email: EmailZod,
  i18nLocale: I18nLocaleZod,
  timezone: TimezoneZod,
})
export type PasswordForgot = z.infer<typeof PasswordForgotZodObject>

export const PasswordResetZodObject = z.object({
  token: EntityZod.id,
  password: PasswordZod,
})
export type PasswordReset = z.infer<typeof PasswordResetZodObject>

export const UserUpdateEmailZodObject = z.object({
  email: EmailZod,
})
export type UserUpdateEmail = z.infer<typeof UserUpdateEmailZodObject>
