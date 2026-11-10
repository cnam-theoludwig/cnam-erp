import { handleJob } from "@repo/utils/function"
import { database, databaseMigrator } from "../database.ts"

let result
const { error } = await handleJob({
  name: "Database: Migrate to Latest",
  handler: async () => {
    const migration = await databaseMigrator.migrateToLatest()
    result = migration.results
    if (migration.error != null) {
      throw migration.error
    }
    console.log(migration.results)
  },
})

if (error != null) {
  console.error(result)
  process.exitCode = 1
}

await database.destroy()
