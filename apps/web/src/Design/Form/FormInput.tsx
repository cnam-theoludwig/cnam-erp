import { classNames } from "../../configuration.ts"

export interface FormInputProps extends React.ComponentProps<"input"> {}
export const FormInput: React.FC<FormInputProps> = (props) => {
  const { className, ...rest } = props

  return (
    <input
      data-slot="input"
      className={classNames(
        "h-10 w-full min-w-0 rounded-md border border-gray bg-white px-3 py-1 text-base text-content-primary outline-none placeholder:text-content-secondary focus-visible:border-border-primary focus-visible:ring-[3px] focus-visible:ring-border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-state-error sm:text-sm",
        className,
      )}
      {...rest}
    />
  )
}
