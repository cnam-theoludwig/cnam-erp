import assert from "node:assert/strict"
import type { CalendarDay } from "../date.ts"
import { describe, it } from "bun:test"
import {
  parseCalendarDay,
  calculateCalendarDay,
  calculateDate,
  calculateCalendarDaysBetween,
  compareCalendarDays,
  formatCalendarDay,
  formatCalendarDayRange,
  getCalendarDayFromDate,
  getCalendarDayEndDate,
  getCalendarDayMonthYear,
  getCalendarDayStartDate,
  getCalendarDayWeekday,
  getDayStartDate,
  calculateDaysBetween,
  calculateMillisecondsFromDuration,
  calculateSecondsFromDuration,
  createUTCDate,
  endOfDay,
  getMonthYearDate,
  getMonthYearFirstCalendarDay,
  getMonthYearKey,
  getMonthYearKeyFromDate,
  parseISO8601DurationSeconds,
  parseMonthYearKey,
  prettyMilliseconds,
  timeConverter,
} from "../date.ts"

const runInTimezone = <Output>(timezone: string, run: () => Output): Output => {
  const timezoneBefore = process.env["TZ"]
  process.env["TZ"] = timezone
  try {
    return run()
  } finally {
    process.env["TZ"] = timezoneBefore
  }
}

const createCalendarDay = (value: string): CalendarDay => {
  const calendarDay = parseCalendarDay(value)
  if (calendarDay == null) {
    throw new Error(`Invalid calendar day "${value}".`)
  }
  return calendarDay
}

describe("date", () => {
  describe("getMonthYearKey", () => {
    it("should format month with zero-padding", () => {
      // Arrange - Given
      const monthYear = { year: 2025, month: 3 }

      // Act - When
      const output = getMonthYearKey(monthYear)

      // Assert - Then
      assert.strictEqual(output, "2025-03")
    })

    it("should not zero-pad two-digit months", () => {
      // Arrange - Given
      const monthYear = { year: 2025, month: 12 }

      // Act - When
      const output = getMonthYearKey(monthYear)

      // Assert - Then
      assert.strictEqual(output, "2025-12")
    })
  })

  describe("parseMonthYearKey", () => {
    it("should parse a zero-padded month key", () => {
      // Arrange - Given
      const input = "2025-03"

      // Act - When
      const output = parseMonthYearKey(input)

      // Assert - Then
      const expected = { year: 2025, month: 3 }
      assert.deepStrictEqual(output, expected)
    })

    it("should round-trip with getMonthYearKey", () => {
      // Arrange - Given
      const input = { year: 2024, month: 12 }

      // Act - When
      const output = parseMonthYearKey(getMonthYearKey(input))

      // Assert - Then
      const expected = input
      assert.deepStrictEqual(output, expected)
    })

    it("should return null when the month is out of range", () => {
      // Arrange - Given
      const inputs = ["2025-00", "2025-13"]

      // Act - When
      const output = inputs.map((input) => {
        return parseMonthYearKey(input)
      })

      // Assert - Then
      const expected = [null, null]
      assert.deepStrictEqual(output, expected)
    })

    it("should return null when the format does not match", () => {
      // Arrange - Given
      const inputs = ["2025-3", "25-03", "2025/03", "2025-03-01", "", "abcd-ef"]

      // Act - When
      const output = inputs.map((input) => {
        return parseMonthYearKey(input)
      })

      // Assert - Then
      const expected = [null, null, null, null, null, null]
      assert.deepStrictEqual(output, expected)
    })
  })

  describe("getMonthYearKeyFromDate", () => {
    it("should extract year and month from a Date object", () => {
      // Arrange - Given
      const date = new Date(2025, 2, 15)

      // Act - When
      const output = getMonthYearKeyFromDate(date)

      // Assert - Then
      assert.strictEqual(output, "2025-03")
    })
  })

  describe("getMonthYearDate", () => {
    it("should stay inside the month when formatted in any timezone", () => {
      // Arrange - Given
      const monthYear = { year: 2025, month: 3 }
      const timezones = ["Pacific/Kiritimati", "Pacific/Pago_Pago", "UTC"]

      // Act - When
      const output = getMonthYearDate(monthYear)

      // Assert - Then
      const expected = ["2025-03", "2025-03", "2025-03"]
      const formattedMonths = timezones.map((timeZone) => {
        return new Intl.DateTimeFormat("en-CA", {
          year: "numeric",
          month: "2-digit",
          timeZone,
        }).format(output)
      })
      assert.deepStrictEqual(formattedMonths, expected)
    })
  })

  describe("prettyMilliseconds", () => {
    it("should format milliseconds into a human-readable string", () => {
      // Arrange - Given
      const input = 133

      // Act - When
      const output = prettyMilliseconds(input)

      // Assert - Then
      const expected = "133ms"
      assert.strictEqual(output, expected)
    })

    it("should format seconds into a human-readable string", () => {
      // Arrange - Given
      const input = 1337

      // Act - When
      const output = prettyMilliseconds(input)

      // Assert - Then
      const expected = "1.3s"
      assert.strictEqual(output, expected)
    })

    it("should format minutes and seconds into a human-readable string", () => {
      // Arrange - Given
      const input = 133777

      // Act - When
      const output = prettyMilliseconds(input)

      // Assert - Then
      const expected = "2m 14s"
      assert.strictEqual(output, expected)
    })

    it("should format exactly 1000ms as seconds, not milliseconds", () => {
      // Arrange - Given
      const input = 1_000

      // Act - When
      const output = prettyMilliseconds(input)

      // Assert - Then
      const expected = "1.0s"
      assert.strictEqual(output, expected)
    })

    it("should format exactly 60000ms as minutes, not seconds", () => {
      // Arrange - Given
      const input = 60_000

      // Act - When
      const output = prettyMilliseconds(input)

      // Assert - Then
      const expected = "1m 0s"
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateMillisecondsFromDuration", () => {
    it("should calculate the milliseconds from 1 hour", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "hour" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 60 * 60 * 1_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 week", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "week" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 7 * 24 * 60 * 60 * 1_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 month", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "month" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 30 * 24 * 60 * 60 * 1_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 year", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "year" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 365.25 * 24 * 60 * 60 * 1_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 second", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "second" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 1_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 2 minutes", () => {
      // Arrange - Given
      const input = { amount: 2, unit: "minute" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 120_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from 1 day", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "day" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 86_400_000
      assert.strictEqual(output, expected)
    })

    it("should calculate the milliseconds from milliseconds", () => {
      // Arrange - Given
      const input = { amount: 250, unit: "millisecond" } as const

      // Act - When
      const output = calculateMillisecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 250
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateSecondsFromDuration", () => {
    it("should calculate the seconds from 1 day", () => {
      // Arrange - Given
      const input = { amount: 1, unit: "day" } as const

      // Act - When
      const output = calculateSecondsFromDuration({ duration: input })

      // Assert - Then
      const expected = 86_400
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateDaysBetween", () => {
    it("should count the days from one day to a later one", () => {
      // Arrange - Given
      const input = { from: new Date("2026-10-21"), to: new Date("2026-11-19") }

      // Act - When
      const output = calculateDaysBetween(input)

      // Assert - Then
      const expected = 29
      assert.strictEqual(output, expected)
    })

    it("should return negative days when the second day comes first", () => {
      // Arrange - Given
      const input = { from: new Date("2026-11-22"), to: new Date("2026-11-19") }

      // Act - When
      const output = calculateDaysBetween(input)

      // Assert - Then
      const expected = -3
      assert.strictEqual(output, expected)
    })

    it("should count whole days between local midnights across a daylight saving time change", () => {
      // Arrange - Given
      const input = runInTimezone("Europe/Paris", () => {
        return { from: new Date(2026, 9, 24), to: new Date(2026, 9, 26) }
      })

      // Act - When
      const output = calculateDaysBetween(input)

      // Assert - Then
      const expected = 2
      assert.strictEqual(output, expected)
    })
  })

  describe("timeConverter.millisecondsToSeconds", () => {
    it("should convert milliseconds to seconds", () => {
      // Arrange - Given
      const input = 1_000

      // Act - When
      const output = timeConverter.millisecondsToSeconds(input)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should round down to the elapsed whole seconds", () => {
      // Arrange - Given
      const input = 1_999

      // Act - When
      const output = timeConverter.millisecondsToSeconds(input)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })
  })

  describe("timeConverter.secondsToMilliseconds", () => {
    it("should convert 1 second to milliseconds", () => {
      // Arrange - Given
      const input = 1

      // Act - When
      const output = timeConverter.secondsToMilliseconds(input)

      // Assert - Then
      const expected = 1_000
      assert.strictEqual(output, expected)
    })

    it("should convert 2 seconds to milliseconds", () => {
      // Arrange - Given
      const input = 2

      // Act - When
      const output = timeConverter.secondsToMilliseconds(input)

      // Assert - Then
      const expected = 2_000
      assert.strictEqual(output, expected)
    })
  })

  describe("timeConverter.millisecondsToHours", () => {
    it("should convert 3_600_000 milliseconds to 1 hour", () => {
      // Arrange - Given
      const input = 3_600_000

      // Act - When
      const output = timeConverter.millisecondsToHours(input)

      // Assert - Then
      const expected = 1
      assert.strictEqual(output, expected)
    })

    it("should convert 7_200_000 milliseconds to 2 hours", () => {
      // Arrange - Given
      const input = 7_200_000

      // Act - When
      const output = timeConverter.millisecondsToHours(input)

      // Assert - Then
      const expected = 2
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateDate", () => {
    it("should advance the date by the given amount of milliseconds", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00.000Z")
      const duration = { amount: 250, unit: "millisecond" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-15T12:00:00.250Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 1 second in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "second" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-15T11:59:59Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 1 minute in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "minute" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-15T11:59:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 1 hour in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "hour" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-15T11:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 1 day in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "day" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-14T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 2 weeks in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -2, unit: "week" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-01T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 3 months in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -3, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-07-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 1 year in the past", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: -1, unit: "year" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2023-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should add 72 hours correctly across a DST spring-forward transition", () => {
      // Arrange - Given
      // 2026-03-29 is EU DST spring-forward (clocks move from UTC+1 to UTC+2)
      const date = new Date("2026-03-27T12:09:47.082Z")
      const duration = { amount: 72, unit: "hour" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2026-03-30T12:09:47.082Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should subtract 72 hours correctly across a DST fall-back transition", () => {
      // Arrange - Given
      // 2026-10-25 is EU DST fall-back (clocks move from UTC+2 to UTC+1)
      const date = new Date("2026-10-27T12:00:00Z")
      const duration = { amount: -72, unit: "hour" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2026-10-24T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should add 3 days without UTC drift across a DST spring-forward transition", () => {
      // Arrange - Given
      // 2026-03-29 is EU DST spring-forward; local-time setters would drop 1 hour.
      const date = new Date("2026-03-27T12:00:00Z")
      const duration = { amount: 3, unit: "day" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2026-03-30T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should add 3 months without UTC drift across a DST spring-forward transition", () => {
      // Arrange - Given
      // 2025-01-15 -> 2025-04-15 crosses the EU DST spring-forward boundary.
      const date = new Date("2025-01-15T12:00:00Z")
      const duration = { amount: 3, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2025-04-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should add 3 months without UTC drift across a DST fall-back transition", () => {
      // Arrange - Given
      // 2025-08-15 -> 2025-11-15 crosses the EU DST fall-back boundary.
      const date = new Date("2025-08-15T12:00:00Z")
      const duration = { amount: 3, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2025-11-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should clamp to the last day when the target month is shorter", () => {
      // Arrange - Given
      const date = new Date("2026-01-31T10:00:00Z")
      const duration = { amount: 1, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2026-02-28T10:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should clamp to the last day when subtracting into a shorter month", () => {
      // Arrange - Given
      const date = new Date("2026-03-31T10:00:00Z")
      const duration = { amount: -1, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2026-02-28T10:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should clamp 29 February to 28 February when the target year is not a leap year", () => {
      // Arrange - Given
      const date = new Date("2028-02-29T10:00:00Z")
      const duration = { amount: 1, unit: "year" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2029-02-28T10:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should add 1 year without UTC drift", () => {
      // Arrange - Given
      const date = new Date("2025-03-15T12:00:00Z")
      const duration = { amount: 1, unit: "year" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2026-03-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should handle zero amount without changing the date", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: 0, unit: "day" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    // Future Date Tests
    it("should calculate the date 1 day in the future", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: 1, unit: "day" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-16T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 2 weeks in the future", () => {
      // Arrange - Given
      const date = new Date("2024-08-15T12:00:00Z")
      const duration = { amount: 2, unit: "week" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-08-29T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 3 months in the future", () => {
      // Arrange - Given
      const date = new Date("2024-07-15T12:00:00Z")
      const duration = { amount: 3, unit: "month" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2024-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })

    it("should calculate the date 1 year in the future", () => {
      // Arrange - Given
      const date = new Date("2024-10-15T12:00:00Z")
      const duration = { amount: 1, unit: "year" } as const

      // Act - When
      calculateDate({ duration, date })

      // Assert - Then
      const expected = new Date("2025-10-15T12:00:00Z")
      assert.deepStrictEqual(date, expected)
    })
  })

  describe("createUTCDate", () => {
    it("should build the UTC midnight of a calendar day", () => {
      // Arrange - Given
      const input = { year: 2026, monthIndex: 5, day: 20 }

      // Act - When
      const output = createUTCDate(input)

      // Assert - Then
      const expected = new Date("2026-06-20T00:00:00.000Z")
      assert.deepStrictEqual(output, expected)
    })

    it("should keep a year before 100 as given", () => {
      // Arrange - Given
      const input = { year: 50, monthIndex: 5, day: 1, hours: 12 }

      // Act - When
      const output = createUTCDate(input)

      // Assert - Then
      const expected = new Date("0050-06-01T12:00:00.000Z")
      assert.deepStrictEqual(output, expected)
    })

    it("should roll an out-of-range month into the next year", () => {
      // Arrange - Given
      const input = { year: 2025, monthIndex: 12, day: 1 }

      // Act - When
      const output = createUTCDate(input)

      // Assert - Then
      const expected = new Date("2026-01-01T00:00:00.000Z")
      assert.deepStrictEqual(output, expected)
    })
  })

  describe("endOfDay", () => {
    it("should return the last instant of the date's calendar day", () => {
      // Arrange - Given
      const input = new Date(2026, 5, 20, 9, 30, 0, 0)

      // Act - When
      const output = endOfDay(input)

      // Assert - Then
      const expected = new Date(2026, 5, 20, 23, 59, 59, 999)
      assert.deepStrictEqual(output, expected)
    })

    it("should not mutate the input date", () => {
      // Arrange - Given
      const input = new Date(2026, 5, 20, 9, 30, 0, 0)

      // Act - When
      endOfDay(input)

      // Assert - Then
      const expected = new Date(2026, 5, 20, 9, 30, 0, 0)
      assert.deepStrictEqual(input, expected)
    })
  })

  describe("parseISO8601DurationSeconds", () => {
    it("should parse hours, minutes and seconds", () => {
      // Arrange - Given
      const input = "PT1H2M3S"

      // Act - When
      const output = parseISO8601DurationSeconds(input)

      // Assert - Then
      const expected = 3_723
      assert.strictEqual(output, expected)
    })

    it("should parse days ahead of the time part", () => {
      // Arrange - Given
      const input = "P1DT1S"

      // Act - When
      const output = parseISO8601DurationSeconds(input)

      // Assert - Then
      const expected = 86_401
      assert.strictEqual(output, expected)
    })

    it("should parse a zero duration", () => {
      // Arrange - Given
      const input = "P0D"

      // Act - When
      const output = parseISO8601DurationSeconds(input)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })

    it("should return null for an invalid duration", () => {
      // Arrange - Given
      const input = "1:02:03"

      // Act - When
      const output = parseISO8601DurationSeconds(input)

      // Assert - Then
      const expected = null
      assert.strictEqual(output, expected)
    })

    it("should return null for a duration without any component", () => {
      // Arrange - Given
      const input = "PT"

      // Act - When
      const output = parseISO8601DurationSeconds(input)

      // Assert - Then
      const expected = null
      assert.strictEqual(output, expected)
    })
  })

  describe("parseCalendarDay", () => {
    it.each(["2026-10-28", "2028-02-29", "0001-01-01", "9999-12-31"])(
      'should accept the real day "%s"',
      (input) => {
        // Act - When
        const output = parseCalendarDay(input)

        // Assert - Then
        const expected = input
        assert.strictEqual(output, expected)
      },
    )

    it.each(["2026-02-30", "2027-02-29", "0000-01-01", "2026-10-28T00:00:00Z", "2026-1-5", ""])(
      'should refuse "%s"',
      (input) => {
        // Act - When
        const output = parseCalendarDay(input)

        // Assert - Then
        const expected = null
        assert.strictEqual(output, expected)
      },
    )
  })

  describe("calculateCalendarDay", () => {
    it.each([
      { calendarDay: "2026-03-28", duration: { amount: 1, unit: "day" }, expected: "2026-03-29" },
      { calendarDay: "2026-03-29", duration: { amount: 1, unit: "day" }, expected: "2026-03-30" },
      { calendarDay: "2026-10-24", duration: { amount: 2, unit: "day" }, expected: "2026-10-26" },
      { calendarDay: "2026-03-28", duration: { amount: 1, unit: "week" }, expected: "2026-04-04" },
      { calendarDay: "2026-01-31", duration: { amount: 1, unit: "month" }, expected: "2026-02-28" },
      { calendarDay: "2028-01-31", duration: { amount: 1, unit: "month" }, expected: "2028-02-29" },
      { calendarDay: "2026-11-30", duration: { amount: 3, unit: "month" }, expected: "2027-02-28" },
      { calendarDay: "2028-02-29", duration: { amount: 1, unit: "year" }, expected: "2029-02-28" },
      { calendarDay: "2028-02-28", duration: { amount: 1, unit: "day" }, expected: "2028-02-29" },
      { calendarDay: "2026-12-31", duration: { amount: 1, unit: "day" }, expected: "2027-01-01" },
      { calendarDay: "2026-01-01", duration: { amount: -1, unit: "day" }, expected: "2025-12-31" },
      { calendarDay: "2026-12-15", duration: { amount: 1, unit: "month" }, expected: "2027-01-15" },
    ] as const)(
      'should add $duration.amount $duration.unit to "$calendarDay"',
      ({ calendarDay, duration, expected }) => {
        // Arrange - Given
        const input = { calendarDay: createCalendarDay(calendarDay), duration }

        // Act - When
        const output = runInTimezone("Europe/Paris", () => {
          return calculateCalendarDay(input)
        })

        // Assert - Then
        assert.strictEqual(output, expected)
      },
    )
  })

  describe("getCalendarDayWeekday", () => {
    it.each(["Pacific/Kiritimati", "America/Los_Angeles", "UTC"])(
      "should resolve the same weekday in the timezone %s",
      (timezone) => {
        // Arrange - Given
        const input = createCalendarDay("2026-10-28")

        // Act - When
        const output = runInTimezone(timezone, () => {
          return getCalendarDayWeekday(input)
        })

        // Assert - Then
        const expected = "wednesday"
        assert.strictEqual(output, expected)
      },
    )

    it("should resolve sunday as the last day of the week", () => {
      // Arrange - Given
      const input = createCalendarDay("2026-11-01")

      // Act - When
      const output = getCalendarDayWeekday(input)

      // Assert - Then
      const expected = "sunday"
      assert.strictEqual(output, expected)
    })
  })

  describe("compareCalendarDays", () => {
    it("should order days chronologically", () => {
      // Arrange - Given
      const days = ["2027-01-01", "2026-10-28", "2026-02-03"].map((day) => {
        return createCalendarDay(day)
      })

      // Act - When
      const output = days.toSorted(compareCalendarDays)

      // Assert - Then
      const expected = ["2026-02-03", "2026-10-28", "2027-01-01"]
      assert.deepEqual(output, expected)
    })

    it("should return zero for the same day", () => {
      // Arrange - Given
      const day = createCalendarDay("2026-10-28")

      // Act - When
      const output = compareCalendarDays(day, day)

      // Assert - Then
      const expected = 0
      assert.strictEqual(output, expected)
    })
  })

  describe("calculateCalendarDaysBetween", () => {
    it("should count a daylight saving change as one day", () => {
      // Arrange - Given
      const from = createCalendarDay("2026-03-28")
      const to = createCalendarDay("2026-03-30")

      // Act - When
      const output = runInTimezone("Europe/Paris", () => {
        return calculateCalendarDaysBetween({ from, to })
      })

      // Assert - Then
      const expected = 2
      assert.strictEqual(output, expected)
    })

    it("should be negative when the end comes first and count across a leap day", () => {
      // Arrange - Given
      const from = createCalendarDay("2028-03-01")
      const to = createCalendarDay("2028-02-28")

      // Act - When
      const output = calculateCalendarDaysBetween({ from, to })

      // Assert - Then
      const expected = -2
      assert.strictEqual(output, expected)
    })
  })

  describe("getCalendarDayFromDate", () => {
    const instant = new Date("2026-10-28T23:30:00.000Z")

    it("should resolve tomorrow in a timezone ahead of UTC", () => {
      // Act - When
      const output = getCalendarDayFromDate({ date: instant, timezone: "Pacific/Auckland" })

      // Assert - Then
      const expected = "2026-10-29"
      assert.strictEqual(output, expected)
    })

    it("should resolve yesterday in a timezone behind UTC", () => {
      // Arrange - Given
      const earlyInstant = new Date("2026-10-28T03:00:00.000Z")

      // Act - When
      const output = getCalendarDayFromDate({
        date: earlyInstant,
        timezone: "America/Los_Angeles",
      })

      // Assert - Then
      const expected = "2026-10-27"
      assert.strictEqual(output, expected)
    })

    it("should keep a year before 1000 on four digits", () => {
      // Arrange - Given
      const input = new Date("0050-06-20T18:42:13.500Z")

      // Act - When
      const output = getCalendarDayFromDate({ date: input, timezone: "UTC" })

      // Assert - Then
      const expected = "0050-06-20"
      assert.strictEqual(output, expected)
    })
  })

  describe("getDayStartDate", () => {
    it("should return the first instant of the day of the instant in the timezone", () => {
      // Arrange - Given
      const input = { date: new Date("2026-10-28T23:30:00.000Z"), timezone: "Pacific/Auckland" }

      // Act - When
      const output = getDayStartDate(input)

      // Assert - Then
      const expected = new Date("2026-10-28T11:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should return the UTC midnight of the instant in UTC", () => {
      // Arrange - Given
      const input = { date: new Date("2026-06-20T18:42:13.500Z"), timezone: "UTC" }

      // Act - When
      const output = getDayStartDate(input)

      // Assert - Then
      const expected = new Date("2026-06-20T00:00:00.000Z")
      assert.deepEqual(output, expected)
    })
  })

  describe("getCalendarDayEndDate", () => {
    it("should end a regular day at the last millisecond in the timezone", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-10-28")

      // Act - When
      const output = getCalendarDayEndDate({ calendarDay, timezone: "Europe/Paris" })

      // Assert - Then
      const expected = new Date("2026-10-28T22:59:59.999Z")
      assert.deepEqual(output, expected)
    })

    it("should end a spring forward day one hour earlier in UTC than a regular day", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-03-29")

      // Act - When
      const output = getCalendarDayEndDate({ calendarDay, timezone: "Europe/Paris" })

      // Assert - Then
      const expected = new Date("2026-03-29T21:59:59.999Z")
      assert.deepEqual(output, expected)
    })

    it("should end a fall back day one hour later in UTC than a regular day", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-10-25")

      // Act - When
      const output = getCalendarDayEndDate({ calendarDay, timezone: "Europe/Paris" })

      // Assert - Then
      const expected = new Date("2026-10-25T22:59:59.999Z")
      assert.deepEqual(output, expected)
    })

    it("should end a day behind UTC on the next UTC day", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-10-28")

      // Act - When
      const output = getCalendarDayEndDate({ calendarDay, timezone: "America/Los_Angeles" })

      // Assert - Then
      const expected = new Date("2026-10-29T06:59:59.999Z")
      assert.deepEqual(output, expected)
    })

    it("should end the day before a skipped midnight at the last instant before the change", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-03-07")

      // Act - When
      const output = getCalendarDayEndDate({ calendarDay, timezone: "America/Havana" })

      // Assert - Then
      const expected = new Date("2026-03-08T04:59:59.999Z")
      assert.deepEqual(output, expected)
    })
  })

  describe("getCalendarDayStartDate", () => {
    it("should start a day at midnight in UTC", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-03-29")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "UTC" })

      // Assert - Then
      const expected = new Date("2026-03-29T00:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should start a day of a year before 1000 at midnight in UTC", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("0050-06-20")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "UTC" })

      // Assert - Then
      const expected = new Date("0050-06-20T00:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should start a spring forward day at midnight before the change in the timezone", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-03-29")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "Europe/Paris" })

      // Assert - Then
      const expected = new Date("2026-03-28T23:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should start the day after a spring forward day one hour earlier in UTC", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-03-30")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "Europe/Paris" })

      // Assert - Then
      const expected = new Date("2026-03-29T22:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should start a day whose midnight a spring forward skips at the first instant of that day", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-03-08")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "America/Havana" })

      // Assert - Then
      const expected = new Date("2026-03-08T05:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should start a day whose midnight a spring forward skips on that day in the timezone", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-09-06")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "America/Santiago" })

      // Assert - Then
      const expected = new Date("2026-09-06T04:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should start a day whose midnight a fall back repeats at the first of the two midnights", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2020-10-30")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "Asia/Amman" })

      // Assert - Then
      const expected = new Date("2020-10-29T21:00:00.000Z")
      assert.deepEqual(output, expected)
    })

    it("should start a day that follows a repeated hour at its only midnight", () => {
      // Arrange - Given
      const calendarDay = createCalendarDay("2026-04-05")

      // Act - When
      const output = getCalendarDayStartDate({ calendarDay, timezone: "America/Santiago" })

      // Assert - Then
      const expected = new Date("2026-04-05T04:00:00.000Z")
      assert.deepEqual(output, expected)
    })
  })

  describe("getCalendarDayMonthYear", () => {
    it("should return the year and the month between 1 and 12", () => {
      // Arrange - Given
      const input = createCalendarDay("2026-12-31")

      // Act - When
      const output = getCalendarDayMonthYear(input)

      // Assert - Then
      const expected = { year: 2026, month: 12 }
      assert.deepEqual(output, expected)
    })
  })

  describe("getMonthYearFirstCalendarDay", () => {
    it("should return the first day of the month", () => {
      // Arrange - Given
      const input = { year: 2026, month: 2 }

      // Act - When
      const output = getMonthYearFirstCalendarDay(input)

      // Assert - Then
      const expected = "2026-02-01"
      assert.strictEqual(output, expected)
    })

    it("should keep a year before 1000 on four digits", () => {
      // Arrange - Given
      const input = { year: 50, month: 12 }

      // Act - When
      const output = getMonthYearFirstCalendarDay(input)

      // Assert - Then
      const expected = "0050-12-01"
      assert.strictEqual(output, expected)
    })
  })

  describe("formatCalendarDay", () => {
    it.each(["Pacific/Kiritimati", "Pacific/Pago_Pago", "UTC"])(
      "should show the same day for a viewer in %s",
      (timezone) => {
        // Arrange - Given
        const calendarDay = createCalendarDay("2026-10-28")

        // Act - When
        const output = runInTimezone(timezone, () => {
          return formatCalendarDay({
            calendarDay,
            locale: "en-GB",
            options: { day: "numeric", month: "long", year: "numeric" },
          })
        })

        // Assert - Then
        const expected = "28 October 2026"
        assert.strictEqual(output, expected)
      },
    )
  })

  describe("formatCalendarDayRange", () => {
    it.each(["Pacific/Kiritimati", "Pacific/Pago_Pago", "UTC"])(
      "should show the same days for a viewer in %s",
      (timezone) => {
        // Arrange - Given
        const input = {
          from: createCalendarDay("2026-10-28"),
          to: createCalendarDay("2026-11-02"),
        }

        // Act - When
        const output = runInTimezone(timezone, () => {
          return formatCalendarDayRange({
            ...input,
            locale: "en-GB",
            options: { day: "numeric", month: "long", year: "numeric" },
          })
        })

        // Assert - Then
        const expected = "28 October – 2 November 2026"
        assert.strictEqual(output, expected)
      },
    )
  })
})
