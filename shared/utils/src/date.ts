import { sortCompare } from "./math.ts"

/** Converts between common time units. */
export const timeConverter = {
  millisecondsToSeconds: (milliseconds: number): number => {
    return Math.floor(milliseconds / 1_000)
  },
  secondsToMilliseconds: (seconds: number): number => {
    return seconds * 1_000
  },
  millisecondsToHours: (milliseconds: number): number => {
    return milliseconds / 3_600_000
  },
}

/**
 * Convert milliseconds to a human readable string (minutes, seconds, milliseconds).
 * @param milliseconds - Milliseconds to humanize.
 * @example
 * prettyMilliseconds(133) // '133ms'
 * prettyMilliseconds(1337) // '1.3s'
 * prettyMilliseconds(133777) // '2m 14s'
 */
export const prettyMilliseconds = (milliseconds: number): string => {
  if (milliseconds < 1_000) {
    return `${Math.round(milliseconds)}ms`
  }
  const seconds = milliseconds / 1_000
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.round(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export const DURATION_UNITS = [
  "millisecond",
  "second",
  "minute",
  "hour",
  "day",
  "week",
  "month",
  "year",
] as const
export type DurationUnit = (typeof DURATION_UNITS)[number]

export const MONTHS_PER_YEAR = 12

export interface MonthYear {
  year: number
  /**
   * Between 1 and 12 (inclusive).
   */
  month: number
}

export const getMonthYearKey = (monthYear: MonthYear): string => {
  return `${monthYear.year}-${String(monthYear.month).padStart(2, "0")}`
}

export const getMonthYearKeyFromDate = (date: Date): string => {
  return getMonthYearKey({ year: date.getFullYear(), month: date.getMonth() + 1 })
}

export interface CreateUTCDateInput {
  year: number
  monthIndex: number
  day: number
  hours?: number
}

/**
 * Builds a UTC instant from calendar components, keeping every year as given. `Date.UTC` reads the years 0 to 99 as 1900 to 1999.
 */
export const createUTCDate = (input: CreateUTCDateInput): Date => {
  const { year, monthIndex, day, hours = 0 } = input
  const date = new Date(0)
  date.setUTCFullYear(year, monthIndex, day)
  date.setUTCHours(hours)
  return date
}

const MONTH_YEAR_KEY_REGEX = /^(?<year>\d{4})-(?<month>\d{2})$/u

export const parseMonthYearKey = (monthYearKey: string): MonthYear | null => {
  const match = MONTH_YEAR_KEY_REGEX.exec(monthYearKey)
  if (match?.groups == null) {
    return null
  }
  const year = Number(match.groups["year"])
  const month = Number(match.groups["month"])
  if (month < 1 || month > MONTHS_PER_YEAR) {
    return null
  }
  return { year, month }
}

const MID_MONTH_DAY = 15
const MIDDAY_HOUR = 12

/**
 * A month has to become an instant before a date formatter can print it, and the formatter may render that instant in a timezone other than the one it was built in. Midnight on the 1st then slips into the previous month, so the instant is taken far from both edges: midday on the 15th.
 */
export const getMonthYearDate = (monthYear: MonthYear): Date => {
  return createUTCDate({
    year: monthYear.year,
    monthIndex: monthYear.month - 1,
    day: MID_MONTH_DAY,
    hours: MIDDAY_HOUR,
  })
}

export const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const
export type Weekday = (typeof WEEKDAYS)[number]

const HOURS_LAST_OF_DAY = 23
const MINUTES_LAST_OF_HOUR = 59
const SECONDS_LAST_OF_MINUTE = 59
const MILLISECONDS_LAST_OF_SECOND = 999

/**
 * Returns the last representable instant (`23:59:59.999`) of the date's calendar day in the server (local) timezone, leaving the day itself unchanged.
 */
export const endOfDay = (date: Date): Date => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    HOURS_LAST_OF_DAY,
    MINUTES_LAST_OF_HOUR,
    SECONDS_LAST_OF_MINUTE,
    MILLISECONDS_LAST_OF_SECOND,
  )
}

const WEEKDAY_INDEX_OFFSET = 6
const WEEKDAYS_PER_WEEK = 7
const getWeekdayFromDayIndex = (dayIndex: number): Weekday => {
  const weekday = WEEKDAYS[(dayIndex + WEEKDAY_INDEX_OFFSET) % WEEKDAYS_PER_WEEK]
  if (weekday == null) {
    throw new Error(`Failed to resolve weekday from day index "${dayIndex}".`)
  }
  return weekday
}

export interface Duration {
  amount: number
  unit: DurationUnit
}

const MILLISECONDS_PER_DURATION_UNIT: Record<DurationUnit, number> = {
  millisecond: 1,
  second: 1_000,
  minute: 60 * 1_000,
  hour: 60 * 60 * 1_000,
  day: 24 * 60 * 60 * 1_000,
  week: 7 * 24 * 60 * 60 * 1_000,
  month: 30 * 24 * 60 * 60 * 1_000,
  year: 365.25 * 24 * 60 * 60 * 1_000,
}

export interface CalculateMillisecondsFromDurationInput {
  duration: Duration
}

/**
 * Calculates the number of milliseconds from a given duration.
 * @param input
 * @returns
 * @example calculateMillisecondsFromDuration({ duration: { amount: 1, unit: "day" } }) // 86400000
 */
export const calculateMillisecondsFromDuration = (
  input: CalculateMillisecondsFromDurationInput,
): number => {
  const { duration } = input
  return duration.amount * MILLISECONDS_PER_DURATION_UNIT[duration.unit]
}

/**
 * Calculates the number of seconds from a given duration.
 * @param input
 * @returns
 * @example calculateSecondsFromDuration({ duration: { amount: 1, unit: "day" } }) // 86400
 */
export const calculateSecondsFromDuration = (
  input: CalculateMillisecondsFromDurationInput,
): number => {
  return calculateMillisecondsFromDuration(input) / 1_000
}

export interface CalculateDaysBetweenInput {
  from: Date
  to: Date
}

/**
 * Counts the calendar days from one day start to another, negative when `to` comes before `from`.
 *
 * Rounds to whole days, so a daylight saving time change between two local midnights still counts as one day.
 * @param input
 * @returns
 * @example calculateDaysBetween({ from: new Date("2026-10-21"), to: new Date("2026-11-19") }) // 29
 */
export const calculateDaysBetween = (input: CalculateDaysBetweenInput): number => {
  const { from, to } = input
  return Math.round((to.getTime() - from.getTime()) / MILLISECONDS_PER_DURATION_UNIT.day)
}

export interface CalculateDateInput {
  /**
   * The period (e.g., 1 day, 1 month) to adjust from the current date.
   * Use a positive amount for future dates and a negative amount for past dates.
   */
  duration: Duration

  /**
   * The current date.
   *
   * NOTE: This date will be mutated.
   */
  date: Date
}

const getLastDayOfUTCMonth = (year: number, monthIndex: number): number => {
  return createUTCDate({ year, monthIndex: monthIndex + 1, day: 0 }).getUTCDate()
}

/** Clamps to the last day of the target month, since `setUTCMonth` alone overflows (31 January + 1 month lands on 3 March). */
const setUTCMonthClamped = (date: Date, targetMonthIndex: number): void => {
  const targetYear = date.getUTCFullYear() + Math.floor(targetMonthIndex / MONTHS_PER_YEAR)
  const normalizedMonthIndex =
    ((targetMonthIndex % MONTHS_PER_YEAR) + MONTHS_PER_YEAR) % MONTHS_PER_YEAR
  const dayOfMonth = Math.min(
    date.getUTCDate(),
    getLastDayOfUTCMonth(targetYear, normalizedMonthIndex),
  )
  date.setUTCFullYear(targetYear, normalizedMonthIndex, dayOfMonth)
}

/**
 * Calculates a date from a given duration.
 * @param input
 * @returns
 * @example calculateDate({ duration: { amount: -1, unit: "day" }, date: new Date() })
 */
export const calculateDate = (input: CalculateDateInput): Date => {
  const { duration, date } = input
  switch (duration.unit) {
    case "millisecond":
    case "second":
    case "minute":
    case "hour":
    case "week": {
      const milliseconds = calculateMillisecondsFromDuration({ duration })
      date.setTime(date.getTime() + milliseconds)
      break
    }
    case "day":
      date.setUTCDate(date.getUTCDate() + duration.amount)
      break
    case "month":
      setUTCMonthClamped(date, date.getUTCMonth() + duration.amount)
      break
    case "year":
      setUTCMonthClamped(date, date.getUTCMonth() + duration.amount * MONTHS_PER_YEAR)
      break
  }
  return date
}

const CALENDAR_DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/u
const CALENDAR_DAY_LENGTH = "YYYY-MM-DD".length
const CALENDAR_DAY_YEAR_LENGTH = "YYYY".length
const COMMON_ERA_FIRST_YEAR = 1

/**
 * A day with no time and no timezone, formatted `YYYY-MM-DD`. Build one with {@link parseCalendarDay}, never with `new Date(calendarDay)`, which reads it as UTC midnight.
 *
 * String order is day order, so two days compare with `<`, `>` and `===`. {@link compareCalendarDays} is the comparator for sorting.
 */
export type CalendarDay = string & { readonly __brand: "CalendarDay" }

const createDateFromCalendarDay = (calendarDay: CalendarDay): Date => {
  const [year = 0, month = 0, day = 0] = calendarDay.split("-").map(Number)
  return createUTCDate({ year, monthIndex: month - 1, day })
}

const createCalendarDayFromDate = (date: Date): CalendarDay => {
  return date.toISOString().slice(0, CALENDAR_DAY_LENGTH) as CalendarDay
}

/**
 * Returns `null` when the value is not a real day of the common era formatted `YYYY-MM-DD`.
 */
export const parseCalendarDay = (value: string): CalendarDay | null => {
  if (!CALENDAR_DAY_REGEX.test(value)) {
    return null
  }
  const calendarDay = value as CalendarDay
  const date = createDateFromCalendarDay(calendarDay)
  const isRealDay =
    date.getUTCFullYear() >= COMMON_ERA_FIRST_YEAR && createCalendarDayFromDate(date) === value
  return isRealDay ? calendarDay : null
}

export type CalendarDayDurationUnit = Extract<DurationUnit, "day" | "week" | "month" | "year">

export interface CalendarDayDuration extends Duration {
  unit: CalendarDayDurationUnit
}

export interface CalculateCalendarDayInput {
  calendarDay: CalendarDay
  /**
   * Month and year clamp to the last day of the target month.
   */
  duration: CalendarDayDuration
}

/**
 * @example calculateCalendarDay({ calendarDay: "2026-01-31", duration: { amount: 1, unit: "month" } }) // "2026-02-28"
 */
export const calculateCalendarDay = (input: CalculateCalendarDayInput): CalendarDay => {
  const { calendarDay, duration } = input
  const date = calculateDate({
    date: createDateFromCalendarDay(calendarDay),
    duration:
      duration.unit === "week"
        ? { amount: duration.amount * WEEKDAYS_PER_WEEK, unit: "day" }
        : { amount: duration.amount, unit: duration.unit },
  })
  return createCalendarDayFromDate(date)
}

export interface CalculateCalendarDaysBetweenInput {
  from: CalendarDay
  to: CalendarDay
}

/**
 * Counts the days from one day to another, negative when `to` comes before `from`.
 */
export const calculateCalendarDaysBetween = (input: CalculateCalendarDaysBetweenInput): number => {
  return calculateDaysBetween({
    from: createDateFromCalendarDay(input.from),
    to: createDateFromCalendarDay(input.to),
  })
}

export const compareCalendarDays = (first: CalendarDay, second: CalendarDay): number => {
  return sortCompare(first, second)
}

export const getCalendarDayWeekday = (calendarDay: CalendarDay): Weekday => {
  return getWeekdayFromDayIndex(createDateFromCalendarDay(calendarDay).getUTCDay())
}

export const getCalendarDayMonthYear = (calendarDay: CalendarDay): MonthYear => {
  const date = createDateFromCalendarDay(calendarDay)
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 }
}

export const getMonthYearFirstCalendarDay = (monthYear: MonthYear): CalendarDay => {
  return createCalendarDayFromDate(
    createUTCDate({ year: monthYear.year, monthIndex: monthYear.month - 1, day: 1 }),
  )
}

export interface FormatCalendarDayInput {
  calendarDay: CalendarDay
  locale: Intl.LocalesArgument
  options?: Intl.DateTimeFormatOptions
}

/**
 * Formats the day in UTC, so the day shown never depends on the viewer's timezone.
 */
export const formatCalendarDay = (input: FormatCalendarDayInput): string => {
  const { calendarDay, locale, options } = input
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(
    createDateFromCalendarDay(calendarDay),
  )
}

export interface FormatCalendarDayRangeInput {
  from: CalendarDay
  to: CalendarDay
  locale: Intl.LocalesArgument
  options?: Intl.DateTimeFormatOptions
}

/**
 * Formats the range in UTC, like {@link formatCalendarDay}.
 */
export const formatCalendarDayRange = (input: FormatCalendarDayRangeInput): string => {
  const { from, to, locale, options } = input
  return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).formatRange(
    createDateFromCalendarDay(from),
    createDateFromCalendarDay(to),
  )
}

type ZonedDateTimePart = "year" | "month" | "day" | "hour" | "minute" | "second"

const LATIN_DIGITS_LOCALE = "en-US"

const zonedDateTimeFormatsByTimezone = new Map<string, Intl.DateTimeFormat>()

const getZonedDateTimeFormat = (timezone: string): Intl.DateTimeFormat => {
  const cachedFormat = zonedDateTimeFormatsByTimezone.get(timezone)
  if (cachedFormat != null) {
    return cachedFormat
  }
  const format = new Intl.DateTimeFormat(LATIN_DIGITS_LOCALE, {
    timeZone: timezone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  zonedDateTimeFormatsByTimezone.set(timezone, format)
  return format
}

const getZonedDateTimeParts = (date: Date, timezone: string): Record<ZonedDateTimePart, string> => {
  const parts = getZonedDateTimeFormat(timezone).formatToParts(date)
  const zonedParts = Object.fromEntries(
    parts.map((part) => {
      return [part.type, part.value]
    }),
  ) as Record<ZonedDateTimePart, string>
  zonedParts.year = zonedParts.year.padStart(CALENDAR_DAY_YEAR_LENGTH, "0")
  return zonedParts
}

export interface GetCalendarDayFromDateInput {
  date: Date
  /**
   * IANA timezone.
   */
  timezone: string
}

export const getCalendarDayFromDate = (input: GetCalendarDayFromDateInput): CalendarDay => {
  const { year, month, day } = getZonedDateTimeParts(input.date, input.timezone)
  return `${year}-${month}-${day}` as CalendarDay
}

const getTimezoneOffsetMilliseconds = (date: Date, timezone: string): number => {
  const { year, month, day, hour, minute, second } = getZonedDateTimeParts(date, timezone)
  const wallClockMilliseconds = Date.parse(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`)
  const wholeSecondMilliseconds = timeConverter.secondsToMilliseconds(
    timeConverter.millisecondsToSeconds(date.getTime()),
  )
  return wallClockMilliseconds - wholeSecondMilliseconds
}

const WALL_CLOCK_OFFSET_LOOKAROUND_MILLISECONDS = calculateMillisecondsFromDuration({
  duration: { amount: 1, unit: "day" },
})

/**
 * Resolves the instant whose wall clock in the timezone reads `wallClockMilliseconds` read as UTC.
 * - A wall clock that a daylight saving change repeats resolves to its earlier instant, so the start of a day whose midnight happens twice is the first one.
 * - A wall clock that a daylight saving change skips moves forward by the length of the skipped time, so the start of a day whose midnight does not exist is the first instant of that day.
 */
const getInstantFromWallClock = (wallClockMilliseconds: number, timezone: string): Date => {
  const offsetBefore = getTimezoneOffsetMilliseconds(
    new Date(wallClockMilliseconds - WALL_CLOCK_OFFSET_LOOKAROUND_MILLISECONDS),
    timezone,
  )
  const offsetAfter = getTimezoneOffsetMilliseconds(
    new Date(wallClockMilliseconds + WALL_CLOCK_OFFSET_LOOKAROUND_MILLISECONDS),
    timezone,
  )
  const instantsReadingTheWallClock = [offsetBefore, offsetAfter]
    .map((offset) => {
      return wallClockMilliseconds - offset
    })
    .filter((instant) => {
      return (
        getTimezoneOffsetMilliseconds(new Date(instant), timezone) ===
        wallClockMilliseconds - instant
      )
    })
  if (instantsReadingTheWallClock.length === 0) {
    return new Date(wallClockMilliseconds - offsetBefore)
  }
  return new Date(Math.min(...instantsReadingTheWallClock))
}

export interface GetCalendarDayInstantInput {
  calendarDay: CalendarDay
  /**
   * IANA timezone.
   */
  timezone: string
}

/**
 * Returns the first instant (`00:00:00.000`) of the day in the timezone.
 */
export const getCalendarDayStartDate = (input: GetCalendarDayInstantInput): Date => {
  return getInstantFromWallClock(
    createDateFromCalendarDay(input.calendarDay).getTime(),
    input.timezone,
  )
}

export interface GetDayStartDateInput {
  date: Date
  /**
   * IANA timezone.
   */
  timezone: string
}

/**
 * Returns the first instant (`00:00:00.000`) of the day the instant falls on in the timezone.
 */
export const getDayStartDate = (input: GetDayStartDateInput): Date => {
  return getCalendarDayStartDate({
    calendarDay: getCalendarDayFromDate(input),
    timezone: input.timezone,
  })
}

/**
 * Returns the last instant (`23:59:59.999`) of the day in the timezone.
 */
export const getCalendarDayEndDate = (input: GetCalendarDayInstantInput): Date => {
  const nextDayStart = getCalendarDayStartDate({
    calendarDay: calculateCalendarDay({
      calendarDay: input.calendarDay,
      duration: { amount: 1, unit: "day" },
    }),
    timezone: input.timezone,
  })
  return new Date(nextDayStart.getTime() - 1)
}

export const getTimeZone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

const ISO_8601_DURATION_REGEX =
  /^P(?:(?<days>\d+)D)?(?:T(?:(?<hours>\d+)H)?(?:(?<minutes>\d+)M)?(?:(?<seconds>\d+)S)?)?$/u

/**
 * Parses an ISO 8601 duration (days and time parts only) into seconds.
 * @param value
 * @returns
 * @example parseISO8601DurationSeconds("PT1H2M3S") // 3723
 */
export const parseISO8601DurationSeconds = (value: string): number | null => {
  const match = ISO_8601_DURATION_REGEX.exec(value)
  if (match?.groups == null) {
    return null
  }
  const hasComponent = Object.values(match.groups).some((component) => {
    return component != null
  })
  if (!hasComponent) {
    return null
  }
  const days = Number(match.groups["days"] ?? 0)
  const hours = Number(match.groups["hours"] ?? 0)
  const minutes = Number(match.groups["minutes"] ?? 0)
  const seconds = Number(match.groups["seconds"] ?? 0)
  return (
    calculateSecondsFromDuration({ duration: { amount: days, unit: "day" } }) +
    calculateSecondsFromDuration({ duration: { amount: hours, unit: "hour" } }) +
    calculateSecondsFromDuration({ duration: { amount: minutes, unit: "minute" } }) +
    seconds
  )
}
