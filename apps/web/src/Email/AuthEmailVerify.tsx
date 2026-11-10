import type { Emails } from "@repo/models/Email"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "@repo/models/I18n"
import { API_URL, WEB_URL } from "@repo/utils/configuration"
import { Link, Section, Text } from "react-email"
import { createTranslator } from "use-intl"
import type * as z from "zod"
import { getIntlConfig } from "../i18n/i18n.ts"
import type { ReactEmail } from "./-components/_utils.ts"
import { EmailCtaButton } from "./-components/EmailCtaButton.tsx"
import { EmailFooter } from "./-components/EmailFooter.tsx"
import { EmailHeading } from "./-components/EmailHeading.tsx"
import { EmailInfoSection } from "./-components/EmailInfoSection.tsx"
import { EmailShell } from "./-components/EmailShell.tsx"

type AuthEmailVerifyProps = z.infer<Emails["AuthEmailVerify"]>

const Component: ReactEmail<AuthEmailVerifyProps> = async (props) => {
  const {
    i18nLocale,
    timezone,
    webURL,
    apiURL,
    email,
    temporaryToken,
    temporaryTokenExpirationDate,
  } = props

  const t = createTranslator(await getIntlConfig(i18nLocale, timezone))

  const verificationURL = new URL("/auth/user/email-verify", apiURL)
  verificationURL.searchParams.set("token", temporaryToken)

  return (
    <EmailShell>
      <EmailHeading>{t("emails.AuthEmailVerify.title")}</EmailHeading>

      <EmailInfoSection>
        <Text className="m-0 text-[14px] text-[#374151]">
          {t.rich("emails.AuthEmailVerify.description", {
            email: () => {
              return <strong className="font-semibold underline underline-offset-2">{email}</strong>
            },
          })}
        </Text>
      </EmailInfoSection>

      <EmailCtaButton href={verificationURL.toString()}>
        {t("emails.AuthEmailVerify.button")}
      </EmailCtaButton>

      <Section className="mb-4 px-0 py-2">
        <Text className="m-0 text-[14px] text-[#374151]">
          {t("emails.AuthEmailVerify.fallback")}
        </Text>
        <Link href={verificationURL.toString()} className="text-[12px] text-[#c1002a] underline">
          {verificationURL.toString()}
        </Link>
        <Text className="m-0 mt-3 text-[13px] text-[#6b7280]">
          {t("emails.AuthEmailVerify.expiration", {
            date: temporaryTokenExpirationDate,
          })}
        </Text>
      </Section>

      <EmailFooter webURL={webURL} />
    </EmailShell>
  )
}

Component.PreviewProps = {
  i18nLocale: I18N_LOCALE_DEFAULT,
  timezone: TIMEZONE_DEFAULT,
  webURL: WEB_URL,
  apiURL: API_URL,
  email: "contact@theoludwig.fr",
  temporaryToken: "01a1c53d-1a27-710e-bdcb-23b63f5abfa3",
  temporaryTokenExpirationDate: new Date("2026-11-10T10:00:00Z"),
}

export const AuthEmailVerify = {
  component: Component,
  getSubject: async (props: AuthEmailVerifyProps) => {
    const t = createTranslator(await getIntlConfig(props.i18nLocale, props.timezone))
    return t("emails.AuthEmailVerify.title")
  },
}

export default Component
