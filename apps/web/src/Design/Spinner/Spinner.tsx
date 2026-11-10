import { useTranslations } from "use-intl"
import { classNames } from "../../configuration.ts"

export interface SpinnerProps {
  size?: number
  className?: string
}
export const Spinner: React.FC<SpinnerProps> = (props) => {
  const { size = 50, className } = props
  const t = useTranslations()

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className={classNames(
        "flex animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
        className,
      )}
      role="status"
      aria-label={t("loading")}
    >
      <span className="sr-only">{t("loading")}</span>
    </div>
  )
}
