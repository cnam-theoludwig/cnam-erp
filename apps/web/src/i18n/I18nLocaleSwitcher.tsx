import { hasI18nLocale, I18N_LOCALE_LABELS, I18N_LOCALES } from "@repo/models/I18n"
import { Languages } from "lucide-react"
import { useLocale, useTranslations } from "use-intl"
import { Button } from "../Design/Button/Button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../Design/DropdownMenu/DropdownMenu.tsx"
import { TooltipHelper } from "../Design/Tooltip/Tooltip.tsx"
import { useAsyncHandler } from "../Hook/useAsyncHandler.ts"
import { useI18nMutation } from "./i18n.functions.ts"

export interface I18nLocaleSwitcherProps {
  className?: string
}
export const I18nLocaleSwitcher: React.FC<I18nLocaleSwitcherProps> = (props) => {
  const { className } = props
  const t = useTranslations()
  const i18nLocaleCurrent = useLocale()
  const i18nMutation = useI18nMutation()
  const { handleAsync } = useAsyncHandler()

  return (
    <DropdownMenu>
      <TooltipHelper label={t("i18n.language")}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={className}
            isLoading={i18nMutation.isPending}
            aria-label={t("i18n.language")}
          >
            <Languages className="size-5" />
          </Button>
        </DropdownMenuTrigger>
      </TooltipHelper>

      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={i18nLocaleCurrent}
          onValueChange={async (i18nLocale) => {
            if (!hasI18nLocale(i18nLocale) || i18nLocale === i18nLocaleCurrent) {
              return
            }
            await handleAsync({
              handle: async () => {
                await i18nMutation.mutateAsync(i18nLocale)
              },
            })
          }}
        >
          {I18N_LOCALES.map((i18nLocale) => {
            return (
              <DropdownMenuRadioItem key={i18nLocale} value={i18nLocale}>
                {I18N_LOCALE_LABELS[i18nLocale]}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
