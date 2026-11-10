import { Label as LabelPrimitive } from "radix-ui"
import { classNames } from "../../configuration.ts"

export interface FormLabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {}
export const FormLabel: React.FC<FormLabelProps> = (props) => {
  const { className, ...rest } = props

  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={classNames(
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        className,
      )}
      {...rest}
    />
  )
}
