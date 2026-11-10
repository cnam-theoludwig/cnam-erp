import { QueueManager, Worker } from "@boringnode/queue"
import { redis as redisAdapter } from "@boringnode/queue/drivers/redis_adapter"
import { fileURLToPath } from "node:url"
import { redis } from "./redis.ts"

const QUEUE_LOCATIONS = [fileURLToPath(new URL("../jobs/**/*.ts", import.meta.url))]

const queueAdapters = {
  redis: redisAdapter(redis),
}

let queueWorker: Worker | null = null
let queueWorkerPromise: Promise<void> | null = null

export const queueInit = async (): Promise<void> => {
  await QueueManager.init({
    default: "redis",
    adapters: queueAdapters,
    locations: QUEUE_LOCATIONS,
  })
}

export const queueStartWorker = async (): Promise<void> => {
  queueWorker = new Worker({
    default: "redis",
    adapters: queueAdapters,
    locations: QUEUE_LOCATIONS,
    worker: {
      gracefulShutdown: false,
    },
  })
  queueWorkerPromise = queueWorker.start()
}

export const queueDestroy = async (): Promise<void> => {
  if (queueWorker != null) {
    await queueWorker.stop()
    await queueWorkerPromise
    queueWorker = null
    queueWorkerPromise = null
  }
  await QueueManager.destroy()
}
