import type { OmitStrict } from "@repo/utils/type"
import { Eye, EyeOff, Lock } from "lucide-react"
import { useTranslations } from "use-intl"
import { useBoolean } from "../../Hook/useBoolean.ts"
import { Button } from "../Button/Button.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip.tsx"
import { FormInputGroup, FormInputGroupAddon, FormInputGroupInput } from "./FormInputGroup.tsx"

export interface FormInputPasswordProps extends OmitStrict<
  React.ComponentProps<typeof FormInputGroupInput>,
  "type"
> {}
export const FormInputPassword: React.FC<FormInputPasswordProps> = (props) => {
  const t = useTranslations()
  const { value: isVisible, toggle: toggleVisibility } = useBoolean()

  const visibilityLabel = isVisible ? t("User.password.hide") : t("User.password.show")

  return (
    <FormInputGroup>
      <FormInputGroupAddon>
        <Lock />
      </FormInputGroupAddon>
      <FormInputGroupInput type={isVisible ? "text" : "password"} {...props} />
      <FormInputGroupAddon className="px-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              onClick={toggleVisibility}
              aria-label={visibilityLabel}
            >
              {isVisible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{visibilityLabel}</p>
          </TooltipContent>
        </Tooltip>
      </FormInputGroupAddon>
    </FormInputGroup>
  )
}
