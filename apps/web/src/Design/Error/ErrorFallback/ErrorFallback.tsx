import type { ErrorComponentProps } from "@tanstack/react-router"
import { useTranslations } from "use-intl"
import { Button } from "../../Button/Button.tsx"
import { ErrorLayout } from "../ErrorLayout/ErrorLayout.tsx"

export interface ErrorFallbackProps extends ErrorComponentProps {}
export const ErrorFallback: React.FC<ErrorFallbackProps> = (props) => {
  const { error, reset } = props
  const t = useTranslations()

  console.error(error)

  return (
    <ErrorLayout
      statusCode={500}
      title={t("errors.serverError")}
      description={t("errors.requestError")}
    >
      <Button className="mt-4" onClick={reset}>
        {t("errors.tryAgain")}
      </Button>
    </ErrorLayout>
  )
}
