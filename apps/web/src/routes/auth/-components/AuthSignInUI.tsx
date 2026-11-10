import type { UserSignInClassic } from "@repo/models/AuthUser"
import { UserSignInClassicZodObject } from "@repo/models/AuthUser"
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
import { FormInputPassword } from "../../../Design/Form/FormInputPassword.tsx"
import { getIsFieldErrorVisible, useFormZodI18n } from "../../../Hook/useFormZodI18n.ts"
import { AuthLayout } from "./AuthLayout.tsx"

export type AuthSignInValues = Pick<UserSignInClassic, "email" | "password">

export interface AuthSignInUIProps {
  initialEmail?: string
  onSubmit: (values: AuthSignInValues) => Promise<void>
}
export const AuthSignInUI: React.FC<AuthSignInUIProps> = (props) => {
  const { initialEmail = "", onSubmit } = props
  const t = useTranslations()

  const getFieldNameLabel = (fieldName: string): string => {
    return t(`User.${fieldName}.label` as "User.email.label")
  }

  const form = useFormZodI18n({
    schema: UserSignInClassicZodObject.pick({ email: true, password: true }),
    getFieldNameLabel,
    defaultValues: { email: initialEmail, password: "" },
    onSubmit: async ({ value }) => {
      await onSubmit(value)
    },
  })

  const isSubmitting = useSelector(form.store, (state) => {
    return state.isSubmitting
  })

  return (
    <AuthLayout title={t("actions.signIn")}>
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

        <form.Field name="password">
          {(field) => {
            const isInvalid = getIsFieldErrorVisible(field)
            return (
              <FormField data-invalid={isInvalid}>
                <div className="flex items-baseline justify-between gap-2">
                  <FormFieldLabel htmlFor={field.name}>{t("User.password.label")}</FormFieldLabel>
                  <Button variant="link" asChild>
                    <Link
                      to="/auth/password/forgot"
                      search={{
                        email:
                          form.getFieldValue("email").length > 0
                            ? form.getFieldValue("email")
                            : null,
                      }}
                    >
                      {t("User.signIn.forgotPassword")}
                    </Link>
                  </Button>
                </div>
                <FormInputPassword
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.value)
                  }}
                  onBlur={field.handleBlur}
                  autoComplete="current-password"
                  aria-invalid={isInvalid}
                  placeholder={t("User.password.placeholder")}
                />
                {isInvalid ? <FormFieldError errors={field.state.meta.errors} /> : <></>}
              </FormField>
            )
          }}
        </form.Field>

        <Button type="submit" isLoading={isSubmitting} className="mt-2 self-center">
          {t("User.signIn.submit")}
        </Button>
      </form>
    </AuthLayout>
  )
}
