import { classNames } from "../../configuration.ts"
import { FormInput } from "./FormInput.tsx"

export interface FormInputGroupProps extends React.ComponentProps<"div"> {}
export const FormInputGroup: React.FC<FormInputGroupProps> = (props) => {
  const { className, ...rest } = props

  return (
    <div
      data-slot="input-group"
      role="group"
      className={classNames(
        "flex h-10 w-full min-w-0 items-center rounded-md border border-gray bg-white has-[[aria-invalid=true]]:border-state-error has-[[data-slot=input-group-control]:focus-visible]:border-border-primary has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-border-primary/30",
        className,
      )}
      {...rest}
    />
  )
}

export interface FormInputGroupAddonProps extends React.ComponentProps<"div"> {}
export const FormInputGroupAddon: React.FC<FormInputGroupAddonProps> = (props) => {
  const { className, ...rest } = props

  return (
    <div
      data-slot="input-group-addon"
      className={classNames(
        "flex items-center px-3 text-content-secondary [&>svg]:size-5",
        className,
      )}
      {...rest}
    />
  )
}

export interface FormInputGroupInputProps extends React.ComponentProps<"input"> {}
export const FormInputGroupInput: React.FC<FormInputGroupInputProps> = (props) => {
  const { className, ...rest } = props

  return (
    <FormInput
      data-slot="input-group-control"
      className={classNames(
        "h-full flex-1 rounded-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
        className,
      )}
      {...rest}
    />
  )
}
