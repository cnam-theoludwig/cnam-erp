import type { I18nLocale, Timezone } from "@repo/models/I18n"
import {
  I18N_LOCALE_COOKIE_MAX_AGE_SECONDS,
  I18N_LOCALE_COOKIE_NAME,
  I18nLocaleZod,
  TIMEZONE_AUTO_DETECTED_COOKIE_NAME,
  TIMEZONE_COOKIE_MAX_AGE_SECONDS,
  TIMEZONE_COOKIE_NAME,
  TimezoneZod,
} from "@repo/models/I18n"
import type { UseMutationResult } from "@tanstack/react-query"
import { useMutation } from "@tanstack/react-query"
import { rootRouteId, useRouteContext, useRouter } from "@tanstack/react-router"
import { createServerFn } from "@tanstack/react-start"
import { getCookie, setCookie } from "@tanstack/react-start/server"
import * as z from "zod"
import { apiClientQuery } from "../configuration.ts"
import { setAuthUser } from "../auth.functions.ts"
import type { I18nState } from "./i18n.ts"
import { getI18nConfig } from "./i18n.ts"

export const I18N_QUERY_KEY = ["i18n"] as const

const getIsTimezoneAutoDetectedFromCookie = (): boolean => {
  return getCookie(TIMEZONE_AUTO_DETECTED_COOKIE_NAME) !== "false"
}

const getI18nState = (input: {
  i18nLocale?: string | null
  timezone?: string | null
  timezoneAutoDetected: boolean
}): I18nState => {
  const i18nConfig = getI18nConfig(input.i18nLocale, input.timezone)
  return { ...i18nConfig, timezoneAutoDetected: input.timezoneAutoDetected }
}

const GetI18nServerInputZodObject = z.object({
  i18nLocale: I18nLocaleZod.nullish(),
  timezone: TimezoneZod.nullish(),
  timezoneAutoDetected: z.boolean().nullish(),
})

export const getI18nServer = createServerFn({
  method: "GET",
})
  .validator(GetI18nServerInputZodObject)
  .handler(async ({ data }) => {
    const i18nLocale =
      data.i18nLocale == null ? getCookie(I18N_LOCALE_COOKIE_NAME) : data.i18nLocale
    const timezoneAutoDetected = data.timezoneAutoDetected ?? getIsTimezoneAutoDetectedFromCookie()
    const timezone = timezoneAutoDetected
      ? (getCookie(TIMEZONE_COOKIE_NAME) ?? data.timezone)
      : (data.timezone ?? getCookie(TIMEZONE_COOKIE_NAME))
    return getI18nState({ i18nLocale, timezone, timezoneAutoDetected })
  })

const SetI18nLocaleServerInputZodObject = z.object({
  i18nLocale: I18nLocaleZod,
  timezone: TimezoneZod.nullish(),
  timezoneAutoDetected: z.boolean().nullish(),
})

export const setI18nLocaleServer = createServerFn({
  method: "POST",
})
  .validator(SetI18nLocaleServerInputZodObject)
  .handler(async ({ data }) => {
    setCookie(I18N_LOCALE_COOKIE_NAME, data.i18nLocale, {
      httpOnly: true,
      secure: true,
      maxAge: I18N_LOCALE_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      path: "/",
    })
    const timezone = data.timezone ?? getCookie(TIMEZONE_COOKIE_NAME)
    const timezoneAutoDetected = data.timezoneAutoDetected ?? getIsTimezoneAutoDetectedFromCookie()
    return getI18nState({ i18nLocale: data.i18nLocale, timezone, timezoneAutoDetected })
  })

const SetTimezoneServerInputZodObject = z.object({
  timezone: TimezoneZod,
  timezoneAutoDetected: z.boolean(),
})

export const setTimezoneServer = createServerFn({
  method: "POST",
})
  .validator(SetTimezoneServerInputZodObject)
  .handler(async ({ data }) => {
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: TIMEZONE_COOKIE_MAX_AGE_SECONDS,
      sameSite: "lax",
      path: "/",
    } as const
    setCookie(TIMEZONE_COOKIE_NAME, data.timezone, cookieOptions)
    setCookie(TIMEZONE_AUTO_DETECTED_COOKIE_NAME, String(data.timezoneAutoDetected), cookieOptions)
  })

export const useI18nMutation = (): UseMutationResult<void, Error, I18nLocale> => {
  const router = useRouter()

  const { queryClient, auth } = useRouteContext({
    from: rootRouteId,
  })
  const updateI18nLocaleMutation = useMutation(
    apiClientQuery.auth.updateI18nLocale.mutationOptions(),
  )

  const setI18nMutation = useMutation({
    mutationFn: async (i18nLocale: I18nLocale): Promise<void> => {
      const i18n = await setI18nLocaleServer({
        data: {
          i18nLocale,
          timezone: auth?.user.timezone,
          timezoneAutoDetected: auth?.user.timezoneAutoDetected,
        },
      })
      queryClient.setQueryData(I18N_QUERY_KEY, () => {
        return i18n
      })
      if (auth != null) {
        try {
          await updateI18nLocaleMutation.mutateAsync({
            body: { i18nLocale },
            headers: {
              authorization: auth.authorization,
            },
          })
          setAuthUser(queryClient, { i18nLocale })
        } catch (error) {
          console.error(error)
        }
      }
      await router.invalidate()
    },
  })

  return setI18nMutation
}

export interface TimezoneMutationInput {
  timezone: Timezone
  timezoneAutoDetected: boolean
}

export const useTimezoneMutation = (): UseMutationResult<void, Error, TimezoneMutationInput> => {
  const router = useRouter()

  const { queryClient, auth } = useRouteContext({
    from: rootRouteId,
  })
  const updateTimezoneMutation = useMutation(apiClientQuery.auth.updateTimezone.mutationOptions())

  const setTimezoneMutation = useMutation({
    mutationFn: async (input: TimezoneMutationInput): Promise<void> => {
      await setTimezoneServer({ data: input })
      if (auth != null) {
        await updateTimezoneMutation.mutateAsync({
          body: {
            timezone: input.timezone,
            timezoneAutoDetected: input.timezoneAutoDetected,
          },
          headers: {
            authorization: auth.authorization,
          },
        })
        setAuthUser(queryClient, {
          timezone: input.timezone,
          timezoneAutoDetected: input.timezoneAutoDetected,
        })
      }
      queryClient.setQueryData(I18N_QUERY_KEY, (oldData: I18nState | undefined) => {
        if (oldData == null) {
          return oldData
        }
        return {
          ...oldData,
          timeZone: input.timezone,
          timezoneAutoDetected: input.timezoneAutoDetected,
        }
      })
      await router.invalidate()
    },
  })

  return setTimezoneMutation
}
