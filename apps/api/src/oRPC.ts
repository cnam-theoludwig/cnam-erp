import type { Context, Meta, Middleware } from "@orpc/server"
import { implement, ORPCError } from "@orpc/server"
import type {
  RequestHeadersPluginContext,
  ResponseHeadersPluginContext,
} from "@orpc/server/plugins"
import { apiContract } from "./routes/contract.ts"
import type { GetAuthOutput } from "./domain/AuthUser/getAuth.ts"
import { getAuth } from "./domain/AuthUser/getAuth.ts"

export interface ORPCContext extends RequestHeadersPluginContext, ResponseHeadersPluginContext {}

export const baseProcedure = implement(apiContract).$context<ORPCContext>()

type ApiMiddleware<TInContext extends ORPCContext, TOutContext extends Context = {}> = Middleware<
  TInContext,
  TOutContext,
  unknown,
  unknown,
  {},
  Meta
>

interface ORPCAuthenticatedContext extends ORPCContext {
  auth: NonNullable<GetAuthOutput>
}

const requireAuthentication: ApiMiddleware<
  ORPCContext,
  Pick<ORPCAuthenticatedContext, "auth">
> = async ({ context, next }) => {
  const auth = await getAuth({ context })
  if (auth == null) {
    throw new ORPCError("UNAUTHORIZED")
  }
  return await next({
    context: {
      auth,
    },
  })
}

export const publicProcedure = baseProcedure

export const authenticatedProcedure = baseProcedure.use(requireAuthentication)
