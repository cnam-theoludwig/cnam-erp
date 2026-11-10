import { database } from "./database/database.ts"
import { queueDestroy } from "./queue.ts"
import { redis } from "./redis.ts"

let isDraining = false

export const getIsDraining = (): boolean => {
  return isDraining
}

export const startDraining = (): void => {
  isDraining = true
}

export const cleanup = async (): Promise<void> => {
  const [queueResult] = await Promise.allSettled([queueDestroy()])
  const results = await Promise.allSettled([database.destroy(), redis.quit()])
  const errors: unknown[] = []
  for (const result of [queueResult, ...results]) {
    if (result.status === "rejected") {
      errors.push(result.reason)
    }
  }
  if (errors.length > 0) {
    throw new AggregateError(errors, "Cleanup failed for one or more resources.")
  }
}
