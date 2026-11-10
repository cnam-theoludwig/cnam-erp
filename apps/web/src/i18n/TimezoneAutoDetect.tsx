import type { User } from "@repo/models/AuthUser"
import { getTimeZone } from "@repo/utils/date"
import { useEffect, useRef } from "react"
import { useTimezoneMutation } from "./i18n.functions.ts"

interface TimezoneAutoDetectProps {
  auth: { user: Pick<User, "timezone"> } | null
  currentTimezone?: string
  isTimezoneAutoDetected: boolean
}

export const TimezoneAutoDetect: React.FC<TimezoneAutoDetectProps> = (props) => {
  const { auth, currentTimezone, isTimezoneAutoDetected } = props
  const timezoneMutation = useTimezoneMutation()
  const hasSynced = useRef(false)
  const syncInputOnMount = useRef({
    auth,
    currentTimezone,
    isTimezoneAutoDetected,
    timezoneMutation,
  })

  useEffect(() => {
    if (hasSynced.current) {
      return
    }
    hasSynced.current = true

    const sync = async (): Promise<void> => {
      const syncInput = syncInputOnMount.current
      if (!syncInput.isTimezoneAutoDetected) {
        return
      }
      const browserTimezone = getTimeZone()
      const hasDisplayTimezone = browserTimezone === syncInput.currentTimezone
      const hasStoredTimezone =
        syncInput.auth == null || browserTimezone === syncInput.auth.user.timezone
      if (hasDisplayTimezone && hasStoredTimezone) {
        return
      }
      await syncInput.timezoneMutation.mutateAsync({
        timezone: browserTimezone,
        timezoneAutoDetected: true,
      })
    }

    sync().catch((error: unknown) => {
      console.error(error)
    })
  }, [])

  return <></>
}
