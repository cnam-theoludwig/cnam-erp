import { apiClient, getHasErrorCode } from "@repo/api-client"
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_COOKIE_NAME,
  AUTH_TOKEN_TYPE,
} from "@repo/models/AuthUser"
import type { AuthState } from "@repo/models/AuthUser"
import type { QueryClient } from "@tanstack/react-query"
import { queryOptions } from "@tanstack/react-query"
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start"
import { deleteCookie, getCookie, setCookie } from "@tanstack/react-start/server"

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
  sameSite: "lax",
  path: "/",
} as const

export const setAuthCookie = createServerOnlyFn((authToken: string): void => {
  setCookie(AUTH_COOKIE_NAME, authToken, AUTH_COOKIE_OPTIONS)
})

export const getAuthServer = createServerFn({
  method: "GET",
}).handler(async () => {
  const authToken = getCookie(AUTH_COOKIE_NAME)
  if (authToken == null || authToken.length <= 0) {
    return null
  }
  try {
    return await apiClient.auth.get({
      headers: {
        authorization: `${AUTH_TOKEN_TYPE} ${authToken}`,
      },
    })
  } catch (error) {
    if (getHasErrorCode(error, "UNAUTHORIZED")) {
      deleteCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS)
      return null
    }
    throw error
  }
})

export const getAuthQueryOptions = queryOptions({
  queryKey: ["authServer"],
  queryFn: async () => {
    return await getAuthServer()
  },
  gcTime: Number.POSITIVE_INFINITY,
})

export const setAuthUser = (
  queryClient: QueryClient,
  patch: Partial<AuthState["user"]> | null,
): void => {
  queryClient.setQueryData(getAuthQueryOptions.queryKey, (oldData) => {
    if (patch == null || oldData == null) {
      return null
    }
    return {
      ...oldData,
      user: {
        ...oldData.user,
        ...patch,
      },
    }
  })
}

export const signOutAuthServer = createServerFn({
  method: "POST",
}).handler(async () => {
  const auth = await getAuthServer()
  if (auth != null) {
    await apiClient.auth.signOut.bySessionId({
      headers: {
        authorization: auth.authorization,
      },
      params: {
        sessionId: auth.authJWT.sessionId,
      },
    })
  }
  deleteCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS)
})
