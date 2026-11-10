import { useEffect, useRef } from "react"
import type {
  AnyFieldMeta,
  DeepKeys,
  FieldInfo,
  FormOptions,
  FormValidateFn,
  ReactFormExtendedApi,
} from "@tanstack/react-form"
import { useForm } from "@tanstack/react-form"
import type { OmitStrict } from "@repo/utils/type"
import { useLocale, useTranslations } from "use-intl"
import type * as z from "zod"

interface UseZodErrorMapI18nInput {
  getFieldNameLabel: (fieldName: string) => string
}

const isEmptyInput = (input: unknown): boolean => {
  return typeof input === "string" && input.trim().length === 0
}

const getInnermostFieldName = (path: PropertyKey[] | undefined): string | undefined => {
  const fieldName = path?.findLast((segment) => {
    return typeof segment === "string"
  })
  return typeof fieldName === "string" ? fieldName : undefined
}

const getFieldPathKey = (path: PropertyKey[]): string => {
  return path.reduce<string>((key, segment) => {
    if (typeof segment === "number") {
      return `${key}[${segment}]`
    }
    return key.length === 0 ? String(segment) : `${key}.${String(segment)}`
  }, "")
}

const useZodErrorMapI18n = (input: UseZodErrorMapI18nInput): z.core.$ZodErrorMap => {
  const { getFieldNameLabel } = input

  const t = useTranslations()

  const errorMap: z.core.$ZodErrorMap = (issue) => {
    const fieldName = getInnermostFieldName(issue.path)
    if (fieldName == null) {
      return { message: t("errors.invalid") }
    }

    if (issue.code === "invalid_union") {
      const innerIssues = issue.errors.flat()
      const meaningfulIssue = innerIssues.find((inner) => {
        return inner.code !== "invalid_value"
      })
      if (meaningfulIssue != null) {
        return errorMap({
          ...meaningfulIssue,
          path: issue.path,
          input: issue.input,
        } as Parameters<z.core.$ZodErrorMap>[0])
      }
    }

    if (issue.code === "invalid_type" && issue.expected === "string") {
      return {
        message: t("errors.required", {
          fieldName: getFieldNameLabel(fieldName),
        }),
      }
    }

    if (issue.code === "too_small" && issue.origin === "string") {
      if (isEmptyInput(issue.input)) {
        return {
          message: t("errors.required", {
            fieldName: getFieldNameLabel(fieldName),
          }),
        }
      }
      return {
        message: t("errors.minLength", {
          fieldName: getFieldNameLabel(fieldName),
          minimum: issue.minimum as number,
        }),
      }
    }

    if (issue.code === "too_big" && issue.origin === "string") {
      return {
        message: t("errors.maxLength", {
          fieldName: getFieldNameLabel(fieldName),
          maximum: issue.maximum as number,
        }),
      }
    }

    if (issue.code === "invalid_format" && issue.format === "email") {
      return {
        message: t("errors.email"),
      }
    }

    return { message: t("errors.invalid") }
  }

  return errorMap
}

type ZodValidatorFields<TFormData> = Partial<Record<DeepKeys<TFormData>, string[] | undefined>>
type ZodValidatorInput<TFormData> = Parameters<FormValidateFn<TFormData>>[0]
type ZodValidator<TFormData> = (
  input: ZodValidatorInput<TFormData>,
) => undefined | { fields: ZodValidatorFields<TFormData> }

const getIssueFieldKey = <TFormData>(
  path: PropertyKey[],
  formApi: ZodValidatorInput<TFormData>["formApi"],
): string => {
  const fieldKey = getFieldPathKey(path)
  const fieldInfos: Partial<Record<string, FieldInfo<TFormData>>> = formApi.fieldInfo
  const isFieldMounted = fieldInfos[fieldKey]?.instance != null
  return isFieldMounted ? fieldKey : getFieldPathKey(path.slice(0, 1))
}

const zodValidator = <TFormData>(
  schema: z.ZodType,
  error: z.core.$ZodErrorMap,
): ZodValidator<TFormData> => {
  return ({ value, formApi }) => {
    const result = schema.safeParse(value, { error })
    if (result.success) {
      return undefined
    }
    const fields: Record<string, string[]> = {}
    for (const issue of result.error.issues) {
      const fieldKey = getIssueFieldKey<TFormData>(issue.path, formApi)
      const fieldErrors = fields[fieldKey] ?? []
      fieldErrors.push(issue.message)
      fields[fieldKey] = fieldErrors
    }
    return { fields }
  }
}

export interface UseFormZodI18nInput<
  TSchema extends z.ZodType,
  TFormData = z.infer<TSchema>,
> extends OmitStrict<
  FormOptions<
    TFormData,
    ZodValidator<TFormData> | undefined,
    ZodValidator<TFormData>,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  >,
  "validators"
> {
  schema: TSchema
  getFieldNameLabel: (fieldName: string) => string
}

export type UseFormZodI18nOutput<TFormData> = ReactFormExtendedApi<
  TFormData,
  ZodValidator<TFormData> | undefined,
  ZodValidator<TFormData>,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  undefined,
  never
>

export type FieldErrorVisibilityMeta = Pick<AnyFieldMeta, "isBlurred" | "isDirty" | "isValid">

export const getIsFieldMetaErrorVisible = (meta: FieldErrorVisibilityMeta): boolean => {
  const isEditedAndLeft = meta.isDirty && meta.isBlurred
  return isEditedAndLeft && !meta.isValid
}

export const getIsFieldErrorVisible = (field: {
  state: { meta: FieldErrorVisibilityMeta }
}): boolean => {
  return getIsFieldMetaErrorVisible(field.state.meta)
}

const showAllFieldErrors = <TFormData>(
  fieldInfos: Partial<Record<string, FieldInfo<TFormData>>>,
): void => {
  for (const fieldInfo of Object.values(fieldInfos)) {
    fieldInfo?.instance?.setMeta((meta) => {
      return { ...meta, isDirty: true, isBlurred: true }
    })
  }
}

const getFormElementOfFields = (fieldNames: string[]): HTMLFormElement | undefined => {
  return fieldNames
    .map((fieldName) => {
      return document.querySelector(`#${CSS.escape(fieldName)}`)?.closest("form")
    })
    .find((formElement) => {
      return formElement != null
    })
}

const getFocusTargetOfInvalidElement = (invalidElement: HTMLElement): HTMLElement | null => {
  if (invalidElement.matches('[aria-invalid="true"]')) {
    return invalidElement
  }
  return (
    invalidElement.querySelector<HTMLElement>('[aria-invalid="true"]') ??
    invalidElement.querySelector<HTMLElement>(
      ':is(button, input, select, textarea):not(:disabled, [aria-hidden="true"], [tabindex="-1"])',
    )
  )
}

const focusFirstInvalidField = (fieldNames: string[]): void => {
  requestAnimationFrame(() => {
    const invalidElement = getFormElementOfFields(fieldNames)?.querySelector<HTMLElement>(
      '[data-invalid="true"], [aria-invalid="true"]',
    )
    if (invalidElement == null) {
      return
    }
    const focusTarget = getFocusTargetOfInvalidElement(invalidElement)
    if (focusTarget == null) {
      invalidElement.scrollIntoView({ block: "center" })
      return
    }
    focusTarget.focus()
  })
}

export const useFormZodI18n = <TSchema extends z.ZodType, TFormData = z.infer<TSchema>>(
  input: UseFormZodI18nInput<TSchema, TFormData>,
): UseFormZodI18nOutput<TFormData> => {
  const { schema, getFieldNameLabel, onSubmitInvalid, ...formOptions } = input

  const error = useZodErrorMapI18n({ getFieldNameLabel })

  const validator = zodValidator<TFormData>(schema, error)
  const form = useForm({
    ...formOptions,
    validators: {
      onChange: validator,
    },
    onSubmitInvalid: (submitInvalidInput) => {
      showAllFieldErrors<TFormData>(submitInvalidInput.formApi.fieldInfo)
      focusFirstInvalidField(Object.keys(submitInvalidInput.formApi.fieldInfo))
      onSubmitInvalid?.(submitInvalidInput)
    },
  })

  const i18nLocaleCurrent = useLocale()
  const previousI18nLocaleRef = useRef(i18nLocaleCurrent)
  useEffect(() => {
    if (previousI18nLocaleRef.current === i18nLocaleCurrent) {
      return
    }
    previousI18nLocaleRef.current = i18nLocaleCurrent
    void form.validate("change")
  }, [i18nLocaleCurrent, form])

  return form
}
