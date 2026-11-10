import type { Kysely } from "kysely"
import { sql } from "kysely"

export const up = async (database: Kysely<any>): Promise<void> => {
  await database.schema.createType("I18nLocale").asEnum(["en-GB", "fr-FR"]).execute()
  await database.schema.createType("UserAccountProvider").asEnum(["classic"]).execute()
  await database.schema.createType("Currency").asEnum(["EUR"]).execute()

  await database.schema
    .createTable("User")
    .addColumn("id", "uuid", (column) => {
      return column
        .notNull()
        .primaryKey()
        .defaultTo(sql`uuidv7()`)
    })
    .addColumn("displayName", "varchar(50)", (column) => {
      return column.notNull()
    })
    .addColumn("email", "varchar(255)", (column) => {
      return column.unique()
    })
    .addColumn("emailPending", "varchar(255)", (column) => {
      return column.unique()
    })
    .addColumn("temporaryToken", "uuid", (column) => {
      return column.unique()
    })
    .addColumn("temporaryTokenExpirationDate", "timestamptz")
    .addColumn("i18nLocale", sql`"I18nLocale"`, (column) => {
      return column.notNull()
    })
    .addColumn("timezone", "text", (column) => {
      return column.notNull().defaultTo("Europe/Paris")
    })
    .addColumn("timezoneAutoDetected", "boolean", (column) => {
      return column.notNull().defaultTo(true)
    })
    .addColumn("createdAt", "timestamptz", (column) => {
      return column.notNull().defaultTo(sql`now()`)
    })
    .execute()

  await database.schema
    .createTable("UserAccount")
    .addColumn("id", "uuid", (column) => {
      return column
        .notNull()
        .primaryKey()
        .defaultTo(sql`uuidv7()`)
    })
    .addColumn("userId", "uuid", (column) => {
      return column.notNull().references("User.id").onDelete("cascade")
    })
    .addColumn("provider", sql`"UserAccountProvider"`, (column) => {
      return column.notNull()
    })
    .addColumn("providerAccountId", "varchar", (column) => {
      return column.notNull()
    })
    .addColumn("information", "varchar", (column) => {
      return column.notNull()
    })
    .addUniqueConstraint("UserAccountUnique", ["provider", "providerAccountId"])
    .execute()

  await database.schema
    .createTable("UserAccountSession")
    .modifyFront(sql`UNLOGGED`)
    .addColumn("id", "uuid", (column) => {
      return column
        .notNull()
        .primaryKey()
        .defaultTo(sql`uuidv7()`)
    })
    .addColumn("userAccountId", "uuid", (column) => {
      return column.notNull().references("UserAccount.id").onDelete("cascade")
    })
    .addColumn("information", "jsonb")
    .addColumn("lastUsed", "timestamptz", (column) => {
      return column.notNull().defaultTo(sql`now()`)
    })
    .execute()

  await database.schema
    .createIndex("UserAccount_userId_index")
    .on("UserAccount")
    .column("userId")
    .execute()
  await database.schema
    .createIndex("UserAccountSession_userAccountId_index")
    .on("UserAccountSession")
    .column("userAccountId")
    .execute()
}

export const down = async (database: Kysely<any>): Promise<void> => {
  await database.schema.dropTable("UserAccountSession").ifExists().execute()
  await database.schema.dropTable("UserAccount").ifExists().execute()
  await database.schema.dropTable("User").ifExists().execute()

  await database.schema.dropType("Currency").ifExists().execute()
  await database.schema.dropType("UserAccountProvider").ifExists().execute()
  await database.schema.dropType("I18nLocale").ifExists().execute()
}
