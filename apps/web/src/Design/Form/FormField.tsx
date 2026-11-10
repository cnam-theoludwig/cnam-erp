import { deduplicate } from "@repo/utils/array"
import { classNames } from "../../configuration.ts"
import type { FormLabelProps } from "./FormLabel.tsx"
import { FormLabel } from "./FormLabel.tsx"

export interface FormFieldProps extends React.ComponentProps<"div"> {}
export const FormField: React.FC<FormFieldProps> = (props) => {
  const { className, ...rest } = props

  return (
    <div
      role="group"
      data-slot="field"
      className={classNames(
        "flex w-full flex-col gap-2 data-[invalid=true]:text-state-error",
        className,
      )}
      {...rest}
    />
  )
}

export interface FormFieldLabelProps extends FormLabelProps {}
export const FormFieldLabel: React.FC<FormFieldLabelProps> = (props) => {
  return <FormLabel data-slot="field-label" {...props} />
}

export interface FormFieldErrorProps extends React.ComponentProps<"div"> {
  errors?: Array<{ message?: string } | string | undefined>
}
export const FormFieldError: React.FC<FormFieldErrorProps> = (props) => {
  const { className, errors = [], ...rest } = props

  const messages = deduplicate(
    errors.map((error) => {
      if (typeof error === "string") {
        return error
      }
      return error?.message
    }),
  ).filter((message) => {
    return message != null
  })

  if (messages.length <= 0) {
    return <></>
  }

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={classNames("text-sm font-normal text-state-error", className)}
      {...rest}
    >
      {messages.join(" ")}
    </div>
  )
}
