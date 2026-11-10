import { database } from "../database.ts"
import { seedUser } from "./AuthUser.ts"

await seedUser()

await database.destroy()
