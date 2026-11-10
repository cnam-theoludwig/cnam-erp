import { getRuntimeConfigurationScript, NAME } from "@repo/utils/configuration"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { queryOptions } from "@tanstack/react-query"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { IntlProvider } from "use-intl"
import { getAuthQueryOptions } from "../auth.functions.ts"
import { seo } from "../configuration.ts"
import { ErrorNotFound } from "../Design/Error/ErrorNotFound/ErrorNotFound.tsx"
import { Toaster } from "../Design/Toast/Toaster.tsx"
import { getI18nServer, I18N_QUERY_KEY } from "../i18n/i18n.functions.ts"
import {
  createI18nTranslator,
  I18N_STATE_FALLBACK,
  loadI18nMessages,
  withI18nMessages,
} from "../i18n/i18n.ts"
import { getI18nMessagesURL, importI18nMessages } from "../i18n/i18nMessagesImport.ts"
import { TimezoneAutoDetect } from "../i18n/TimezoneAutoDetect.tsx"
import stylesCss from "../styles.css?url"

interface RootDocumentProps extends React.PropsWithChildren {}
const RootDocument = (props: RootDocumentProps): React.ReactNode => {
  const { children } = props

  const context = Route.useRouteContext()
  const auth = context.auth ?? null
  const i18n = context.i18n ?? I18N_STATE_FALLBACK

  return (
    <html lang={i18n.locale} spellCheck={false}>
      <head>
        <HeadContent />
      </head>

      <body>
        <IntlProvider {...withI18nMessages(i18n)}>
          <Toaster />
          <TimezoneAutoDetect
            auth={auth}
            currentTimezone={i18n.timeZone}
            isTimezoneAutoDetected={i18n.timezoneAutoDetected}
          />

          {children}
        </IntlProvider>

        <TanStackDevtools
          config={{
            position: "middle-right",
          }}
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "TanStack Form",
              render: <FormDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context }) => {
    const auth = await context.queryClient.query({ ...getAuthQueryOptions, staleTime: "static" })
    const i18n = await context.queryClient.query(
      queryOptions({
        staleTime: "static",
        queryKey: I18N_QUERY_KEY,
        queryFn: async () => {
          return await getI18nServer({
            data: {
              i18nLocale: auth?.user.i18nLocale,
              timezone: auth?.user.timezone,
              timezoneAutoDetected: auth?.user.timezoneAutoDetected,
            },
          })
        },
      }),
    )
    await loadI18nMessages(i18n.locale, importI18nMessages)
    return { auth, i18n }
  },
  head: ({ match }) => {
    const i18n = match.context.i18n ?? I18N_STATE_FALLBACK
    const t = createI18nTranslator(i18n)
    const i18nMessagesURL = getI18nMessagesURL(i18n.locale)
    return {
      meta: seo({
        title: NAME,
        description: t("meta.description", { name: NAME }),
      }),
      links: [
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
        { rel: "stylesheet", href: stylesCss },
        ...(i18nMessagesURL == null
          ? []
          : [
              {
                rel: "preload",
                href: i18nMessagesURL,
                as: "fetch",
                crossOrigin: "anonymous",
              } as const,
            ]),
      ],
      scripts: [{ children: getRuntimeConfigurationScript() }],
    }
  },
  shellComponent: RootDocument,
  notFoundComponent: ErrorNotFound,
})
