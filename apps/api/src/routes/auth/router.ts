import { authClassicSignInRouter } from "./auth.classic.signIn/auth.classic.signIn.router.ts"
import { authEmailRouter } from "./auth.email/auth.email.router.ts"
import { authGetRouter } from "./auth.get/auth.get.router.ts"
import { authPasswordForgotRouter } from "./auth.password.forgot/auth.password.forgot.router.ts"
import { authPasswordResetRouter } from "./auth.password.reset/auth.password.reset.router.ts"
import { authSignOutRouter } from "./auth.signOut/auth.signOut.router.ts"
import { authUpdateI18nLocaleRouter } from "./auth.updateI18nLocale/auth.updateI18nLocale.router.ts"
import { authUpdateTimezoneRouter } from "./auth.updateTimezone/auth.updateTimezone.router.ts"

export const authRouter = {
  get: authGetRouter,
  updateI18nLocale: authUpdateI18nLocaleRouter,
  updateTimezone: authUpdateTimezoneRouter,
  email: authEmailRouter,
  signOut: authSignOutRouter,
  classic: {
    signIn: authClassicSignInRouter,
  },
  password: {
    forgot: authPasswordForgotRouter,
    reset: authPasswordResetRouter,
  },
}
