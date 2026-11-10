import { USER_ACCOUNTS_MOCK, USERS_MOCK } from "@repo/models/mock/AuthUser"
import { handleJob } from "@repo/utils/function"
import { database } from "../database.ts"

export const seedUser = async (): Promise<void> => {
  await handleJob({
    name: "Seed User",
    handler: async () => {
      await database.transaction().execute(async (transaction) => {
        await transaction.insertInto("User").values(structuredClone(USERS_MOCK)).execute()
        await transaction
          .insertInto("UserAccount")
          .values(structuredClone(USER_ACCOUNTS_MOCK))
          .execute()
      })
      return {
        additionalInformation: `${USERS_MOCK.length} users`,
      }
    },
  })
}
