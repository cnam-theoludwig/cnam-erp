import { useCallback } from "react"
import { toast } from "sonner"
import { useTranslations } from "use-intl"

export interface HandleAsyncInput<Data> {
  success?: React.ReactNode | ((data: Data) => React.ReactNode)
  error?: (error: unknown) => React.ReactNode | undefined
  handle: () => Promise<Data>
}

export interface UseAsyncHandlerOutput {
  handleAsync: <Data>(input: HandleAsyncInput<Data>) => Promise<boolean>
}

export const useAsyncHandler = (): UseAsyncHandlerOutput => {
  const t = useTranslations()

  const handleAsync = useCallback(
    async <Data>(input: HandleAsyncInput<Data>): Promise<boolean> => {
      return await toast
        .promise(input.handle, {
          loading: t("loading"),
          success: input.success,
          error: (error): React.ReactNode => {
            const customMessage = input.error?.(error)
            if (customMessage != null) {
              return customMessage
            }
            console.error(error)
            return t("errors.requestError")
          },
        })
        .unwrap()
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    },
    [t],
  )

  return { handleAsync }
}
