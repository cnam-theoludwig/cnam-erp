import { ROUTE_AUTH_WEB_SIGN_IN } from "@repo/models/AuthUser"
import { useMutation } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { signOutAuthServer } from "../../auth.functions.ts"
import { useAsyncHandler } from "../../Hook/useAsyncHandler.ts"
import { UserHomeUI } from "./-components/UserHomeUI.tsx"

interface RouteComponentProps {}
const RouteComponent: React.FC<RouteComponentProps> = () => {
  const { auth } = Route.useRouteContext()

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await signOutAuthServer()
    },
  })
  const { handleAsync } = useAsyncHandler()

  return (
    <UserHomeUI
      displayName={auth.user.displayName}
      isSigningOut={signOutMutation.isPending}
      onSignOut={async () => {
        await handleAsync({
          handle: async () => {
            await signOutMutation.mutateAsync()
            window.location.assign(ROUTE_AUTH_WEB_SIGN_IN)
          },
        })
      }}
    />
  )
}

export const Route = createFileRoute("/user/")({
  component: RouteComponent,
})
