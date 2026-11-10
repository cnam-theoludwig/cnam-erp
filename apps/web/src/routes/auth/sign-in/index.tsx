import { getHasErrorCode } from "@repo/api-client"
import { CallbackZod } from "@repo/models/AuthUser"
import { EmailZod, getDefaultCatchZod } from "@repo/models/Entity"
import { getTimeZone } from "@repo/utils/date"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, stripSearchParams } from "@tanstack/react-router"
import { useLocale, useTimeZone, useTranslations } from "use-intl"
import * as z from "zod"
import { apiClientQuery } from "../../../configuration.ts"
import { useAsyncHandler } from "../../../Hook/useAsyncHandler.ts"
import { AuthSignInUI } from "../-components/AuthSignInUI.tsx"

interface RouteComponentProps {}
const RouteComponent: React.FC<RouteComponentProps> = () => {
  const searchParams = Route.useSearch()
  const t = useTranslations()
  const i18nLocale = useLocale()
  const timezone = useTimeZone() ?? getTimeZone()

  const classicSignInMutation = useMutation(apiClientQuery.auth.classic.signIn.mutationOptions())
  const { handleAsync } = useAsyncHandler()

  return (
    <AuthSignInUI
      initialEmail={searchParams.email ?? ""}
      onSubmit={async (values) => {
        await handleAsync({
          error: (error) => {
            if (getHasErrorCode(error, "UNAUTHORIZED")) {
              return t("User.signIn.errorInvalidCredentials")
            }
            return undefined
          },
          handle: async () => {
            const { redirectURL } = await classicSignInMutation.mutateAsync({
              body: {
                ...values,
                callback: searchParams.callback,
                i18nLocale,
                timezone,
              },
            })
            window.location.href = redirectURL
          },
        })
      }}
    />
  )
}

const SearchParamsZodObject = z.object({
  callback: getDefaultCatchZod(CallbackZod, null),
  email: getDefaultCatchZod(EmailZod.nullish(), null),
})

export const Route = createFileRoute("/auth/sign-in/")({
  component: RouteComponent,
  validateSearch: SearchParamsZodObject,
  search: {
    middlewares: [stripSearchParams(SearchParamsZodObject.parse({}))],
  },
})
