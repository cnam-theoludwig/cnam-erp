import Redis from "ioredis"
import { REDIS_CONNECTION } from "../configuration.ts"

export const redis = new Redis(REDIS_CONNECTION)
