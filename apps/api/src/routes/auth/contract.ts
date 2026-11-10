import { authClassicSignInContract } from "./auth.classic.signIn/auth.classic.signIn.contract.ts"
import { authEmailContract } from "./auth.email/auth.email.contract.ts"
import { authGetContract } from "./auth.get/auth.get.contract.ts"
import { authPasswordForgotContract } from "./auth.password.forgot/auth.password.forgot.contract.ts"
import { authPasswordResetContract } from "./auth.password.reset/auth.password.reset.contract.ts"
import { authSignOutContract } from "./auth.signOut/auth.signOut.contract.ts"
import { authUpdateI18nLocaleContract } from "./auth.updateI18nLocale/auth.updateI18nLocale.contract.ts"
import { authUpdateTimezoneContract } from "./auth.updateTimezone/auth.updateTimezone.contract.ts"

export const authContract = {
  get: authGetContract,
  updateI18nLocale: authUpdateI18nLocaleContract,
  updateTimezone: authUpdateTimezoneContract,
  email: authEmailContract,
  signOut: authSignOutContract,
  classic: {
    signIn: authClassicSignInContract,
  },
  password: {
    forgot: authPasswordForgotContract,
    reset: authPasswordResetContract,
  },
}
