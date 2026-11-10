import fs from "node:fs"
import path from "node:path"
import { handleJob } from "@repo/utils/function"
import { DATABASE_MIGRATIONS_PATH } from "../database.ts"

const { error } = await handleJob({
  name: "Database: Migrate Make",
  handler: async () => {
    const name = process.argv[2]
    if (name == null || name.length === 0) {
      throw new Error("Usage: node src/database/commands/migrateMake.ts <migration_name>")
    }
    const timestamp = Date.now()
    const filename = `${timestamp}_${name}.ts`
    const filePath = path.join(DATABASE_MIGRATIONS_PATH, filename)
    const content = `import type { Kysely } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {}

export const down = async (database: Kysely<any>): Promise<void> => {}
`
    await fs.promises.writeFile(filePath, content, "utf-8")
    return { additionalInformation: filename }
  },
})

if (error != null) {
  process.exitCode = 1
}
