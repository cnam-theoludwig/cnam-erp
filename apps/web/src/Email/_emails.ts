import type { Emails, EmailType } from "@repo/models/Email"
import type * as z from "zod"
import type { ReactEmail } from "./-components/_utils.ts"
import { AuthEmailUpdateWarning } from "./AuthEmailUpdateWarning.tsx"
import { AuthEmailVerify } from "./AuthEmailVerify.tsx"
import { AuthPasswordReset } from "./AuthPasswordReset.tsx"

export const EMAILS = {
  AuthEmailVerify,
  AuthPasswordReset,
  AuthEmailUpdateWarning,
} as const satisfies {
  [key in EmailType]: {
    component: ReactEmail<z.infer<Emails[key]>>
    getSubject: (props: z.infer<Emails[key]>) => Promise<string>
  }
}
