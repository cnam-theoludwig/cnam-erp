import type { PasswordReset } from "@repo/models/AuthUser"
import { PasswordResetZodObject } from "@repo/models/AuthUser"
import { useSelector } from "@tanstack/react-form"
import { useTranslations } from "use-intl"
import { Button } from "../../../Design/Button/Button.tsx"
import { FormField, FormFieldError, FormFieldLabel } from "../../../Design/Form/FormField.tsx"
import { FormInputPassword } from "../../../Design/Form/FormInputPassword.tsx"
import { getIsFieldErrorVisible, useFormZodI18n } from "../../../Hook/useFormZodI18n.ts"
import { AuthLayout } from "./AuthLayout.tsx"

export interface AuthPasswordResetUIProps {
  token: PasswordReset["token"]
  onSubmit: (values: PasswordReset) => Promise<void>
}
export const AuthPasswordResetUI: React.FC<AuthPasswordResetUIProps> = (props) => {
  const { token, onSubmit } = props
  const t = useTranslations()

  const getFieldNameLabel = (fieldName: string): string => {
    return t(`User.${fieldName}.label` as "User.password.label")
  }

  const form = useFormZodI18n({
    schema: PasswordResetZodObject,
    getFieldNameLabel,
    defaultValues: { token, password: "" },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const isSubmitting = useSelector(form.store, (state) => {
    return state.isSubmitting
  })

  return (
    <AuthLayout title={t("User.passwordReset.title")} subtitle={t("User.passwordReset.subtitle")}>
      <form
        noValidate
        onSubmit={async (event) => {
          event.preventDefault()
          await form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="password">
          {(field) => {
            const isInvalid = getIsFieldErrorVisible(field)
            return (
              <FormField data-invalid={isInvalid}>
                <FormFieldLabel htmlFor={field.name}>{t("User.password.label")}</FormFieldLabel>
                <FormInputPassword
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.value)
                  }}
                  onBlur={field.handleBlur}
                  autoComplete="new-password"
                  aria-invalid={isInvalid}
                  placeholder={t("User.password.placeholder")}
                />
                {isInvalid ? <FormFieldError errors={field.state.meta.errors} /> : <></>}
              </FormField>
            )
          }}
        </form.Field>

        <Button type="submit" isLoading={isSubmitting} className="mt-2 self-center">
          {t("User.passwordReset.submit")}
        </Button>
      </form>
    </AuthLayout>
  )
}
