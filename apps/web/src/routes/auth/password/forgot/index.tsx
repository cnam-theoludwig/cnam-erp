import { EmailZod, getDefaultCatchZod } from "@repo/models/Entity"
import { getTimeZone } from "@repo/utils/date"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { useLocale, useTimeZone, useTranslations } from "use-intl"
import * as z from "zod"
import { apiClientQuery } from "../../../../configuration.ts"
import { useAsyncHandler } from "../../../../Hook/useAsyncHandler.ts"
import { AuthPasswordForgotUI } from "../../-components/AuthPasswordForgotUI.tsx"

interface RouteComponentProps {}
const RouteComponent: React.FC<RouteComponentProps> = () => {
  const searchParams = Route.useSearch()
  const t = useTranslations()
  const i18nLocale = useLocale()
  const timezone = useTimeZone() ?? getTimeZone()

  const passwordForgotMutation = useMutation(apiClientQuery.auth.password.forgot.mutationOptions())
  const { handleAsync } = useAsyncHandler()

  return (
    <AuthPasswordForgotUI
      initialEmail={searchParams.email ?? ""}
      onSubmit={async (values) => {
        await handleAsync({
          success: t("User.passwordForgot.success"),
          handle: async () => {
            await passwordForgotMutation.mutateAsync({
              body: { ...values, i18nLocale, timezone },
            })
          },
        })
      }}
    />
  )
}

const SearchParamsZodObject = z.object({
  email: getDefaultCatchZod(EmailZod.nullish(), null),
})

export const Route = createFileRoute("/auth/password/forgot/")({
  component: RouteComponent,
  validateSearch: SearchParamsZodObject,
  search: {
    middlewares: [stripSearchParams(SearchParamsZodObject.parse({}))],
  },
})
