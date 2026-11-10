import { authContract } from "./auth/contract.ts"
import { healthContract } from "./health/contract.ts"

export const apiContract = {
  auth: authContract,
  health: healthContract,
}
