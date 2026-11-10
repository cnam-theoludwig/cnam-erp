import { IS_PRODUCTION } from "@repo/utils/configuration"

export const PORT = Math.trunc(Number(process.env["PORT"] ?? "4500"))
export const HOST = process.env["HOST"] ?? "0.0.0.0"

export const AUTH_SECRET = process.env["AUTH_SECRET"] ?? "secret"

export const EMAIL_HOST = process.env["EMAIL_HOST"] ?? "0.0.0.0"
export const EMAIL_PORT = Math.trunc(Number(process.env["EMAIL_PORT"] ?? "1026"))
export const EMAIL_USER = process.env["EMAIL_USER"] ?? "no-reply@studrp.local"
export const EMAIL_PASSWORD = process.env["EMAIL_PASSWORD"] ?? "password"
export const EMAIL_CONNECTION = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
  ignoreTLS: !IS_PRODUCTION,
}

export const REDIS_HOST = process.env["REDIS_HOST"] ?? "0.0.0.0"
export const REDIS_PASSWORD = process.env["REDIS_PASSWORD"] ?? "password"
export const REDIS_PORT = Math.trunc(Number(process.env["REDIS_PORT"] ?? "6380"))
export const REDIS_CONNECTION = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
}
