import type { Emails } from "@repo/models/Email"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "@repo/models/I18n"
import { WEB_URL } from "@repo/utils/configuration"
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

type AuthPasswordResetProps = z.infer<Emails["AuthPasswordReset"]>

const Component: ReactEmail<AuthPasswordResetProps> = async (props) => {
  const {
    i18nLocale,
    timezone,
    webURL,
    userDisplayName,
    temporaryToken,
    durationAmount,
    durationUnit,
  } = props

  const t = createTranslator(await getIntlConfig(i18nLocale, timezone))

  const resetURL = new URL("/auth/password/reset", webURL)
  resetURL.searchParams.set("token", temporaryToken)

  const durationLabel = t(`Duration.${durationUnit}`, { amount: durationAmount })

  return (
    <EmailShell>
      <EmailHeading>{t("emails.AuthPasswordReset.title")}</EmailHeading>

      <EmailInfoSection>
        <Text className="m-0 text-[14px] text-[#374151]">
          {t.rich("emails.AuthPasswordReset.description", {
            name: () => {
              return (
                <strong className="font-semibold underline underline-offset-2">
                  {userDisplayName}
                </strong>
              )
            },
          })}
        </Text>
      </EmailInfoSection>

      <EmailCtaButton href={resetURL.toString()}>
        {t("emails.AuthPasswordReset.button")}
      </EmailCtaButton>

      <Section className="mb-4 px-0 py-2">
        <Text className="m-0 text-[14px] text-[#374151]">
          {t("emails.AuthPasswordReset.fallback")}
        </Text>
        <Link href={resetURL.toString()} className="text-[12px] text-[#c1002a] underline">
          {resetURL.toString()}
        </Link>
        <Text className="m-0 mt-3 text-[13px] text-[#6b7280]">
          {t("emails.AuthPasswordReset.expiration", { duration: durationLabel })}
        </Text>
        <Text className="m-0 mt-3 text-[13px] text-[#6b7280]">
          {t("emails.AuthPasswordReset.footer")}
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
  userDisplayName: "Théo LUDWIG",
  temporaryToken: "01a1c53d-1a27-710e-bdcb-23b63f5abfa3",
  temporaryTokenExpirationDate: new Date("2026-11-10T10:00:00Z"),
  durationAmount: 1,
  durationUnit: "hour",
}

export const AuthPasswordReset = {
  component: Component,
  getSubject: async (props: AuthPasswordResetProps) => {
    const t = createTranslator(await getIntlConfig(props.i18nLocale, props.timezone))
    return t("emails.AuthPasswordReset.subject")
  },
}

export default Component
