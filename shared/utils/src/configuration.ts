export interface RuntimeConfiguration {
  VERSION: string
  WEB_URL: string
  API_URL: string
}
declare global {
  var RUNTIME_CONFIGURATION: Partial<RuntimeConfiguration> | undefined
}

const RUNTIME_CONFIGURATION_GLOBAL_NAME = "RUNTIME_CONFIGURATION" satisfies keyof typeof globalThis

const process = globalThis.process ?? { env: {} }
const runtimeConfiguration = globalThis[RUNTIME_CONFIGURATION_GLOBAL_NAME] ?? {}

export const NAME = "STUD'RP"
export const THEME_COLOR = "#c1002a"
export const VERSION: string =
  process.env["VERSION"] ?? runtimeConfiguration.VERSION ?? "0.0.0-develop"
export const NODE_ENV = process.env["NODE_ENV"] ?? "development"
export const IS_PRODUCTION = NODE_ENV === "production"

export const WEB_URL: string =
  process.env["WEB_URL"] ??
  runtimeConfiguration.WEB_URL ??
  process.env["VITE_WEB_URL"] ??
  import.meta.env.VITE_WEB_URL ??
  "http://localhost:4000"
export const API_URL: string =
  process.env["API_URL"] ??
  runtimeConfiguration.API_URL ??
  process.env["VITE_API_URL"] ??
  import.meta.env.VITE_API_URL ??
  "http://localhost:4500"

export const getRuntimeConfigurationScript = (): string => {
  const configuration: RuntimeConfiguration = { VERSION, WEB_URL, API_URL }
  return `globalThis.${RUNTIME_CONFIGURATION_GLOBAL_NAME}=${JSON.stringify(configuration)}`
}

export const API_KEY_HEADER_NAME = "x-api-key"
export const API_KEY = process.env["API_KEY"] ?? "secret"

export const KIBIBYTE = 1024
export const MEGABYTE = 1024 * KIBIBYTE

export const PASSWORD_HASH_MEMORY_KIB_MAX = (64 * MEGABYTE) / KIBIBYTE
export const PASSWORD_HASH_MEMORY_KIB = IS_PRODUCTION
  ? PASSWORD_HASH_MEMORY_KIB_MAX
  : Math.trunc(Number(process.env["PASSWORD_HASH_MEMORY_KIB"] ?? PASSWORD_HASH_MEMORY_KIB_MAX))
