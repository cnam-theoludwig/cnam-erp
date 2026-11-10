import type { PasswordForgot } from "@repo/models/AuthUser"
import { PasswordForgotZodObject } from "@repo/models/AuthUser"
import { useSelector } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { Mail } from "lucide-react"
import { useTranslations } from "use-intl"
import { Button } from "../../../Design/Button/Button.tsx"
import { FormField, FormFieldError, FormFieldLabel } from "../../../Design/Form/FormField.tsx"
import {
  FormInputGroup,
  FormInputGroupAddon,
  FormInputGroupInput,
} from "../../../Design/Form/FormInputGroup.tsx"
import { getIsFieldErrorVisible, useFormZodI18n } from "../../../Hook/useFormZodI18n.ts"
import { AuthLayout } from "./AuthLayout.tsx"

export type AuthPasswordForgotValues = Pick<PasswordForgot, "email">

export interface AuthPasswordForgotUIProps {
  initialEmail?: string
  onSubmit: (values: AuthPasswordForgotValues) => Promise<void>
}
export const AuthPasswordForgotUI: React.FC<AuthPasswordForgotUIProps> = (props) => {
  const { initialEmail = "", onSubmit } = props
  const t = useTranslations()

  const getFieldNameLabel = (fieldName: string): string => {
    return t(`User.${fieldName}.label` as "User.email.label")
  }

  const form = useFormZodI18n({
    schema: PasswordForgotZodObject.pick({ email: true }),
    getFieldNameLabel,
    defaultValues: { email: initialEmail },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const isSubmitting = useSelector(form.store, (state) => {
    return state.isSubmitting
  })

  return (
    <AuthLayout title={t("User.passwordForgot.title")} subtitle={t("User.passwordForgot.subtitle")}>
      <form
        noValidate
        onSubmit={async (event) => {
          event.preventDefault()
          await form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="email">
          {(field) => {
            const isInvalid = getIsFieldErrorVisible(field)
            return (
              <FormField data-invalid={isInvalid}>
                <FormFieldLabel htmlFor={field.name}>{t("User.email.label")}</FormFieldLabel>
                <FormInputGroup>
                  <FormInputGroupAddon>
                    <Mail />
                  </FormInputGroupAddon>
                  <FormInputGroupInput
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onChange={(event) => {
                      field.handleChange(event.target.value)
                    }}
                    onBlur={field.handleBlur}
                    autoComplete="email"
                    aria-invalid={isInvalid}
                    placeholder={t("User.email.placeholder")}
                  />
                </FormInputGroup>
                {isInvalid ? <FormFieldError errors={field.state.meta.errors} /> : <></>}
              </FormField>
            )
          }}
        </form.Field>

        <div className="mt-2 flex items-center justify-center gap-4">
          <Button variant="ghost" asChild>
            <Link
              to="/auth/sign-in"
              search={{ email: initialEmail.length > 0 ? initialEmail : null }}
            >
              {t("User.passwordForgot.backToSignIn")}
            </Link>
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {t("User.passwordForgot.submit")}
          </Button>
        </div>
      </form>
    </AuthLayout>
  )
}
