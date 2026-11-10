import { EntityZod, getDefaultCatchZod } from "@repo/models/Entity"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useTranslations } from "use-intl"
import * as z from "zod"
import { apiClientQuery } from "../../../../configuration.ts"
import { useAsyncHandler } from "../../../../Hook/useAsyncHandler.ts"
import { AuthPasswordResetUI } from "../../-components/AuthPasswordResetUI.tsx"

interface RouteComponentProps {}
const RouteComponent: React.FC<RouteComponentProps> = () => {
  const { token } = Route.useRouteContext()
  const t = useTranslations()
  const navigate = useNavigate()

  const passwordResetMutation = useMutation(apiClientQuery.auth.password.reset.mutationOptions())
  const { handleAsync } = useAsyncHandler()

  return (
    <AuthPasswordResetUI
      token={token}
      onSubmit={async (values) => {
        await handleAsync({
          success: t("User.passwordReset.success"),
          handle: async () => {
            const { email } = await passwordResetMutation.mutateAsync({ body: values })
            await navigate({ to: "/auth/sign-in", search: { callback: null, email } })
          },
        })
      }}
    />
  )
}

const SearchParamsZodObject = z.object({
  token: getDefaultCatchZod(EntityZod.id.nullish(), null),
})

export const Route = createFileRoute("/auth/password/reset/")({
  component: RouteComponent,
  validateSearch: SearchParamsZodObject,
  beforeLoad: ({ search }) => {
    if (search.token == null) {
      throw redirect({ to: "/auth/password/forgot" })
    }
    return { token: search.token }
  },
})
