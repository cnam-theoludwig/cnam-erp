import { useCallback, useMemo, useState } from "react"

export interface UseBooleanOutput {
  value: boolean
  setValue: React.Dispatch<React.SetStateAction<boolean>>
  setTrue: () => void
  setFalse: () => void
  toggle: () => void
}

export interface UseBooleanInput {
  /**
   * The initial value of the boolean.
   * @default false
   */
  initialValue?: boolean
}

/**
 * Hook to manage a boolean state.
 * @param input
 * @returns
 */
export const useBoolean = (input: UseBooleanInput = {}): UseBooleanOutput => {
  const { initialValue = false } = input

  const [value, setValue] = useState(initialValue)

  const toggle = useCallback((): void => {
    setValue((old) => {
      return !old
    })
  }, [])

  const setTrue = useCallback((): void => {
    setValue(true)
  }, [])

  const setFalse = useCallback((): void => {
    setValue(false)
  }, [])

  const result = useMemo(() => {
    return {
      value,
      setValue,
      toggle,
      setTrue,
      setFalse,
    }
  }, [setFalse, setTrue, toggle, value, setValue])

  return result
}
