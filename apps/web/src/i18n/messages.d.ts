import type { I18nLocale } from "@repo/models/I18n"
import type messages from "./translations/fr-FR.json"

declare module "use-intl" {
  interface AppConfig {
    Locale: I18nLocale
    Messages: typeof messages
  }
}
