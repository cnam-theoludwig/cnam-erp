import { Slot as SlotPrimitive } from "radix-ui"
import { cloneElement, isValidElement } from "react"
import { classNames } from "../../configuration.ts"
import { Spinner } from "../Spinner/Spinner.tsx"
import { Ripple } from "./Ripple.tsx"

interface SlottableProps {
  asChild?: boolean
  child: React.ReactNode
  children: (childContent: React.ReactNode) => React.ReactNode
}
const Slottable: React.FC<SlottableProps> = (props) => {
  const { asChild = false, child, children, ...rest } = props

  if (!asChild) {
    return <>{children(child)}</>
  }
  if (!isValidElement(child)) {
    return <></>
  }
  return cloneElement(
    child,
    rest,
    children((child.props as { children: React.ReactNode }).children),
  )
}

const BUTTON_VARIANTS = ["primary", "ghost", "link"] as const
type ButtonVariant = (typeof BUTTON_VARIANTS)[number]

const RIPPLE_COLORS = {
  primary: "rgba(255, 255, 255, 0.3)",
  ghost: "rgba(193, 0, 42, 0.15)",
  link: null,
} as const satisfies Record<ButtonVariant, string | null>

export interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean
  variant?: ButtonVariant
  isLoading?: boolean
}
export const Button: React.FC<ButtonProps> = (props) => {
  const {
    asChild = false,
    variant = "primary",
    isLoading = false,
    disabled = false,
    className,
    children,
    ...rest
  } = props

  const Component = asChild ? SlotPrimitive.Root : "button"
  const isDisabled = disabled || isLoading
  const rippleColor = RIPPLE_COLORS[variant]

  return (
    <Component
      data-slot="button"
      className={classNames(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary disabled:cursor-not-allowed disabled:opacity-50",
        {
          "rounded-lg bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary-strong":
            variant === "primary",
          "rounded-lg px-2 py-1 text-content-body hover:bg-background-gray": variant === "ghost",
          "text-primary underline underline-offset-3 hover:text-primary-strong": variant === "link",
        },
        className,
      )}
      disabled={isDisabled}
      {...rest}
    >
      <Slottable asChild={asChild} child={children}>
        {(childContent) => {
          return (
            <>
              {isLoading ? <Spinner size={16} className="text-inherit" /> : <></>}
              {childContent}
              {rippleColor == null ? <></> : <Ripple color={rippleColor} />}
            </>
          )
        }}
      </Slottable>
    </Component>
  )
}
