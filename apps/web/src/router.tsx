import { getErrorCode, getHasErrorCode } from "@repo/api-client"
import { ROUTE_AUTH_WEB_SIGN_IN } from "@repo/models/AuthUser"
import { calculateMillisecondsFromDuration } from "@repo/utils/date"
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { createRouter } from "@tanstack/react-router"
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query"
import { setAuthUser } from "./auth.functions.ts"
import { ErrorFallback } from "./Design/Error/ErrorFallback/ErrorFallback.tsx"
import { ErrorNotFound } from "./Design/Error/ErrorNotFound/ErrorNotFound.tsx"
import { I18N_QUERY_KEY } from "./i18n/i18n.functions.ts"
import type { I18nState } from "./i18n/i18n.ts"
import { I18N_STATE_FALLBACK, loadI18nMessages } from "./i18n/i18n.ts"
import { importI18nMessages } from "./i18n/i18nMessagesImport.ts"
import { PagePendingFallback } from "./Layout/PagePendingFallback.tsx"
import { routeTree } from "./routeTree.gen.ts"
import type { RouterContext } from "./routes/__root.tsx"

export const getRouter = () => {
  const handleError = async (error: unknown): Promise<void> => {
    if (!getHasErrorCode(error, "UNAUTHORIZED")) {
      return
    }
    if (router.state.location.pathname.startsWith("/auth/")) {
      return
    }
    setAuthUser(queryClient, null)
    await router.navigate({
      to: ROUTE_AUTH_WEB_SIGN_IN,
      search: {
        callback: router.state.location.href,
      },
      reloadDocument: true,
    })
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (getErrorCode(error) != null) {
            return false
          }
          const QUERY_TRANSIENT_RETRY_MAX = 3
          return failureCount < QUERY_TRANSIENT_RETRY_MAX
        },
        refetchOnWindowFocus: false,
      },
    },
    mutationCache: new MutationCache({
      onError: handleError,
    }),
    queryCache: new QueryCache({
      onError: handleError,
    }),
  })

  const context: RouterContext = {
    queryClient,
  }

  const router = createRouter({
    routeTree,
    context,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ErrorFallback,
    defaultNotFoundComponent: ErrorNotFound,
    defaultPendingComponent: PagePendingFallback,
    defaultPendingMs: calculateMillisecondsFromDuration({
      duration: { amount: 100, unit: "millisecond" },
    }),
    defaultPendingMinMs: calculateMillisecondsFromDuration({
      duration: { amount: 300, unit: "millisecond" },
    }),
    scrollRestoration: true,
    dehydrate: () => {
      const i18n = queryClient.getQueryData<I18nState>(I18N_QUERY_KEY) ?? I18N_STATE_FALLBACK
      return { i18nLocale: i18n.locale }
    },
    hydrate: async (dehydrated) => {
      await loadI18nMessages(dehydrated.i18nLocale, importI18nMessages)
    },
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  return router
}
