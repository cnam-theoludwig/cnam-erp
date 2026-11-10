import { authRouter } from "./auth/router.ts"
import { healthRouter } from "./health/router.ts"

export const apiRouter = {
  auth: authRouter,
  health: healthRouter,
}
