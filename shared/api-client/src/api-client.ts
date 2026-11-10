import type { ORPCErrorCode } from "@orpc/client"
import { createORPCClient, ORPCError } from "@orpc/client"
import type { ContractRouterClient } from "@orpc/contract"
import { ResponseValidationPlugin } from "@orpc/contract/plugins"
import { OpenAPILink } from "@orpc/openapi-client/fetch"
import { apiContract } from "@repo/api"
import { API_URL } from "@repo/utils/configuration"

export const apiClient: ContractRouterClient<typeof apiContract> = createORPCClient(
  new OpenAPILink(apiContract, {
    url: API_URL,
    plugins: [new ResponseValidationPlugin(apiContract)],
    fetch: async (input: URL | RequestInfo, init?: RequestInit) => {
      return await fetch(input, {
        ...init,
        credentials: "include",
      })
    },
  }),
)

export const getIsORPCError = (error: unknown): error is ORPCError<ORPCErrorCode, any> => {
  return error instanceof ORPCError
}

export const getErrorCode = (error: unknown): ORPCErrorCode | null => {
  if (!getIsORPCError(error)) {
    return null
  }
  return error.code
}

export const getHasErrorCode = (error: unknown, code: ORPCErrorCode): boolean => {
  return getErrorCode(error) === code
}
