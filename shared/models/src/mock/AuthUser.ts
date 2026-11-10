import type { User, UserAccount } from "../AuthUser.ts"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "../I18n.ts"

type UserMock = Pick<User, "id" | "displayName" | "email" | "i18nLocale" | "timezone">
type UserAccountMock = Pick<
  UserAccount,
  "userId" | "provider" | "providerAccountId" | "information"
>

export const USER_THEO_MOCK = {
  id: "01a1c53d-1a27-710e-bdcb-23b63f5abfa3",
  displayName: "Théo LUDWIG",
  email: "contact@theoludwig.fr",
  i18nLocale: I18N_LOCALE_DEFAULT,
  timezone: TIMEZONE_DEFAULT,
} as const satisfies UserMock

export const USER_MINA_MOCK = {
  id: "01a1c53d-1a37-736b-9665-418bf73a02d5",
  displayName: "Mina TOUMA",
  email: "mina.touma@example.com",
  i18nLocale: I18N_LOCALE_DEFAULT,
  timezone: TIMEZONE_DEFAULT,
} as const satisfies UserMock

export const USER_AUDE_MOCK = {
  id: "01a1c53d-1a4b-77f4-b90c-93cef29140b3",
  displayName: "Aude BRUANT",
  email: "aude.bruant@example.com",
  i18nLocale: I18N_LOCALE_DEFAULT,
  timezone: TIMEZONE_DEFAULT,
} as const satisfies UserMock

export const USERS_MOCK = [
  USER_THEO_MOCK,
  USER_MINA_MOCK,
  USER_AUDE_MOCK,
] as const satisfies UserMock[]

/**
 * Every seeded account signs in with the password `test`, hashed with `bun run password-hash`.
 */
export const USER_ACCOUNTS_MOCK = [
  {
    userId: USER_THEO_MOCK.id,
    provider: "classic",
    providerAccountId: USER_THEO_MOCK.id,
    information:
      "$argon2id$v=19$m=65536,t=3,p=4$bPVCf754/rosAoRFXKFTYw$snTWQR9v2yOqDwGbGB/aMD63TPmFqIUzlfmg9NbE99M",
  },
  {
    userId: USER_MINA_MOCK.id,
    provider: "classic",
    providerAccountId: USER_MINA_MOCK.id,
    information:
      "$argon2id$v=19$m=65536,t=3,p=4$rlywTpiqpNZelX8gvfLRqg$90HWEJbmNbNQ5WsDwI00A6Xa4xtotg8KRqvTeIDuIMo",
  },
  {
    userId: USER_AUDE_MOCK.id,
    provider: "classic",
    providerAccountId: USER_AUDE_MOCK.id,
    information:
      "$argon2id$v=19$m=65536,t=3,p=4$T2Yy7WL89GRYCm/fJ0iLbQ$7li2qkk5HFoeh91DOj/I8+p7vI8M6/Ot18OPJwKm1f0",
  },
] as const satisfies UserAccountMock[]
