import { handleJob } from "@repo/utils/function"
import { database, databaseTypegen } from "../database.ts"
import fs from "node:fs"
import { fileURLToPath } from "node:url"

const { error } = await handleJob({
  name: "Database: Typegen",
  handler: async () => {
    const result = await databaseTypegen.typegen()
    const isCalendarDayUsed = result.lines.some((line) => {
      return line.includes("CalendarDay")
    })
    const codegenContent = result.lines
      .flatMap((line) => {
        return isCalendarDayUsed && line === 'import type { ColumnType } from "kysely"'
          ? [line, 'import type { CalendarDay } from "@repo/utils/date"']
          : [line]
      })
      .join("\n")
    const codegenPath = fileURLToPath(new URL("../codegen.ts", import.meta.url))
    await fs.promises.writeFile(codegenPath, codegenContent, "utf-8")
    return {
      additionalInformation:
        '\n  File path: "' +
        codegenPath +
        '"\n  Tables count: ' +
        result.tables.length +
        "\n  Enums count: " +
        result.enums.length +
        "\n",
    }
  },
})

if (error != null) {
  process.exitCode = 1
}

await database.destroy()
