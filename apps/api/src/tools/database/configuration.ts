export const DATABASE_DIALECT = "postgres"
export const DATABASE_USER = process.env["DATABASE_USER"] ?? "cnam_erp_user"
export const DATABASE_PASSWORD = process.env["DATABASE_PASSWORD"] ?? "password"
export const DATABASE_NAME = process.env["DATABASE_NAME"] ?? "cnam_erp"
export const DATABASE_HOST = process.env["DATABASE_HOST"] ?? "localhost"
export const DATABASE_PORT = Math.trunc(Number(process.env["DATABASE_PORT"] ?? "5434"))
export const DATABASE_DEBUG = process.env["DATABASE_DEBUG"] === "true"
export const DATABASE_POOL_CONNECTIONS_MAX = Math.trunc(
  Number(process.env["DATABASE_POOL_CONNECTIONS_MAX"] ?? "10"),
)
