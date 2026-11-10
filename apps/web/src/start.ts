import { createORPCErrorFromJson, isORPCErrorJson, toORPCError } from "@orpc/client"
import { getIsORPCError } from "@repo/api-client"
import { WEB_URL } from "@repo/utils/configuration"
import { createSerializationAdapter } from "@tanstack/react-router"
import { createCsrfMiddleware, createStart } from "@tanstack/react-start"

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => {
    return context.handlerType === "serverFn"
  },
  origin: new URL(WEB_URL).origin,
})

const apiErrorSerializationAdapter = createSerializationAdapter({
  key: "ORPCError",
  test: getIsORPCError,
  toSerializable: (error) => {
    return JSON.stringify(error.toJSON())
  },
  fromSerializable: (serializedError) => {
    const errorJSON: unknown = JSON.parse(serializedError)
    if (!isORPCErrorJson(errorJSON)) {
      return toORPCError(errorJSON)
    }
    return createORPCErrorFromJson(errorJSON)
  },
})

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware],
    serializationAdapters: [apiErrorSerializationAdapter],
  }
})
