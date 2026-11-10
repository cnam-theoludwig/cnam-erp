import { Link } from "@tanstack/react-router"
import { useTranslations } from "use-intl"
import { Button } from "../../Button/Button.tsx"
import { ErrorLayout } from "../ErrorLayout/ErrorLayout.tsx"

export interface ErrorNotFoundProps {}
export const ErrorNotFound: React.FC<ErrorNotFoundProps> = () => {
  const t = useTranslations()

  return (
    <ErrorLayout
      statusCode={404}
      title={t("errors.pageNotFound")}
      description={t("errors.pageDoesntExist")}
    >
      <Button asChild className="mt-4">
        <Link to="/">{t("errors.returnToHomePage")}</Link>
      </Button>
    </ErrorLayout>
  )
}
