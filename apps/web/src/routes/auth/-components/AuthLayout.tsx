import { NAME } from "@repo/utils/configuration"
import { I18nLocaleSwitcher } from "../../../i18n/I18nLocaleSwitcher.tsx"

export interface AuthLayoutProps extends React.PropsWithChildren {
  title: string
  subtitle?: string
}
export const AuthLayout: React.FC<AuthLayoutProps> = (props) => {
  const { title, subtitle, children } = props

  return (
    <main className="flex min-h-full items-center justify-center bg-linear-to-br from-primary/15 via-background to-background-gray px-4 py-8">
      <div className="relative w-full max-w-md rounded-xl bg-white/80 px-5 pt-12 pb-6 shadow-lg ring-1 ring-black/5 backdrop-blur sm:px-8">
        <I18nLocaleSwitcher className="absolute top-2 left-2" />

        <p className="text-center text-4xl font-extrabold tracking-tight text-primary">{NAME}</p>
        <h1 className="mt-3 text-center text-3xl font-semibold text-content-primary">{title}</h1>
        {subtitle == null ? (
          <></>
        ) : (
          <p className="mt-2 text-center text-content-secondary">{subtitle}</p>
        )}

        <div className="mt-6">{children}</div>
      </div>
    </main>
  )
}
