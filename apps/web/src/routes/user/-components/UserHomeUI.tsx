import type { User } from "@repo/models/AuthUser"
import { useTranslations } from "use-intl"
import { Button } from "../../../Design/Button/Button.tsx"

export interface UserHomeUIProps {
  displayName: User["displayName"]
  isSigningOut: boolean
  onSignOut: () => Promise<void>
}
export const UserHomeUI: React.FC<UserHomeUIProps> = (props) => {
  const { displayName, isSigningOut, onSignOut } = props
  const t = useTranslations()

  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-semibold text-content-primary">
        {t("User.greeting", { displayName })}
      </h1>
      <Button isLoading={isSigningOut} onClick={onSignOut}>
        {t("actions.signOut")}
      </Button>
    </main>
  )
}
