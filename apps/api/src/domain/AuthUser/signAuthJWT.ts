import type { AuthJWT } from "@repo/models/AuthUser"
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_JWT_PURPOSE, JWT_ALG } from "@repo/models/AuthUser"
import type { OmitStrict } from "@repo/utils/type"
import * as jose from "jose"
import { AUTH_SECRET } from "../../configuration.ts"

export const signAuthJWT = async (input: OmitStrict<AuthJWT, "purpose">): Promise<string> => {
  const payload: AuthJWT = { ...input, purpose: AUTH_JWT_PURPOSE }
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALG })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_COOKIE_MAX_AGE_SECONDS}s`)
    .sign(new TextEncoder().encode(AUTH_SECRET))
}
