import type { OverrideStrict } from "@repo/utils/type"
import type * as UAParser from "ua-parser-js"
import type { DB, UserAccountSession } from "./codegen.ts"

export type Database = OverrideStrict<
  DB,
  {
    UserAccountSession: OverrideStrict<
      UserAccountSession,
      {
        information: UAParser.IResult | null
      }
    >
  }
>

export type DatabaseTable = keyof Database
