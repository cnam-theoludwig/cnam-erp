import { ROUTE_AUTH_WEB_USER } from "@repo/models/AuthUser"
import type { Emails } from "@repo/models/Email"
import { I18N_LOCALE_DEFAULT, TIMEZONE_DEFAULT } from "@repo/models/I18n"
import { WEB_URL } from "@repo/utils/configuration"
import { Text } from "react-email"
import { createTranslator } from "use-intl"
import type * as z from "zod"
import { getIntlConfig } from "../i18n/i18n.ts"
import type { ReactEmail } from "./-components/_utils.ts"
import { EmailCtaButton } from "./-components/EmailCtaButton.tsx"
import { EmailFooter } from "./-components/EmailFooter.tsx"
import { EmailHeading } from "./-components/EmailHeading.tsx"
import { EmailInfoSection } from "./-components/EmailInfoSection.tsx"
import { EmailShell } from "./-components/EmailShell.tsx"

type AuthEmailUpdateWarningProps = z.infer<Emails["AuthEmailUpdateWarning"]>

const Component: ReactEmail<AuthEmailUpdateWarningProps> = async (props) => {
  const { i18nLocale, timezone, webURL, emailOld, emailPending } = props

  const t = createTranslator(await getIntlConfig(i18nLocale, timezone))

  const userURL = new URL(ROUTE_AUTH_WEB_USER, webURL)

  return (
    <EmailShell>
      <EmailHeading>{t("emails.AuthEmailUpdateWarning.title")}</EmailHeading>

      <EmailInfoSection>
        <Text className="m-0 text-[14px] text-[#374151]">
          {t.rich("emails.AuthEmailUpdateWarning.description", {
            emailOld: () => {
              return (
                <strong className="font-semibold underline underline-offset-2">{emailOld}</strong>
              )
            },
            emailPending: () => {
              return (
                <strong className="font-semibold underline underline-offset-2">
                  {emailPending}
                </strong>
              )
            },
          })}
        </Text>
        <Text className="m-0 mt-3 text-[13px] text-[#6b7280]">
          {t("emails.AuthEmailUpdateWarning.warning")}
        </Text>
      </EmailInfoSection>

      <EmailCtaButton href={userURL.toString()}>
        {t("emails.AuthEmailUpdateWarning.button")}
      </EmailCtaButton>

      <EmailFooter webURL={webURL} />
    </EmailShell>
  )
}

Component.PreviewProps = {
  i18nLocale: I18N_LOCALE_DEFAULT,
  timezone: TIMEZONE_DEFAULT,
  webURL: WEB_URL,
  emailOld: "contact@theoludwig.fr",
  emailPending: "theo.ludwig@example.com",
}

export const AuthEmailUpdateWarning = {
  component: Component,
  getSubject: async (props: AuthEmailUpdateWarningProps) => {
    const t = createTranslator(await getIntlConfig(props.i18nLocale, props.timezone))
    return t("emails.AuthEmailUpdateWarning.title")
  },
}

export default Component
