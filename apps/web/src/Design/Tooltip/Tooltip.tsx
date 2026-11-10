import { Tooltip as TooltipPrimitive } from "radix-ui"
import { classNames } from "../../configuration.ts"
import { useBoolean } from "../../Hook/useBoolean.ts"

export interface TooltipProviderProps extends React.ComponentProps<
  typeof TooltipPrimitive.Provider
> {}
export const TooltipProvider: React.FC<TooltipProviderProps> = (props) => {
  const { delayDuration = 0, ...rest } = props

  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...rest}
    />
  )
}

export interface TooltipProps extends React.ComponentProps<typeof TooltipPrimitive.Root> {}
export const Tooltip: React.FC<TooltipProps> = (props) => {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

export interface TooltipTriggerProps extends React.ComponentProps<
  typeof TooltipPrimitive.Trigger
> {}
export const TooltipTrigger: React.FC<TooltipTriggerProps> = (props) => {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

export interface TooltipContentProps extends React.ComponentProps<typeof TooltipPrimitive.Content> {
  /**
   * Set to `false` for content that brings its own surface, where the dark arrow would float detached from it.
   */
  showArrow?: boolean

  /**
   * A trigger hidden while its tooltip is open, sends no leave event, so the tooltip stays open and would otherwise be positioned at the top left of the page.
   */
  hideWhenDetached?: boolean
}
export const TooltipContent: React.FC<TooltipContentProps> = (props) => {
  const {
    className,
    sideOffset = 0,
    showArrow = true,
    hideWhenDetached = true,
    children,
    ...rest
  } = props

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        hideWhenDetached={hideWhenDetached}
        className={classNames(
          "z-50 w-fit max-w-xs origin-(--radix-tooltip-content-transform-origin) rounded-md bg-background-dark px-3 py-1.5 text-sm text-white data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95",
          "**:data-[slot=button]:text-white **:data-[slot=button]:underline [&_a]:text-white [&_a]:underline",
          className,
        )}
        {...rest}
      >
        {children}
        {showArrow ? (
          <TooltipPrimitive.Arrow className="z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-xs bg-background-dark fill-background-dark" />
        ) : (
          <></>
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export interface TooltipHelperProps extends React.PropsWithChildren {
  label: React.ReactNode | (() => React.ReactNode)
  tooltipContentProps?: React.ComponentProps<typeof TooltipContent>
}
export const TooltipHelper: React.FC<TooltipHelperProps> = (props) => {
  const { label, children, tooltipContentProps } = props
  const { value: open, setValue: setOpen, toggle } = useBoolean()

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild onClick={toggle}>
        {children}
      </TooltipTrigger>
      {open ? (
        <TooltipContent {...tooltipContentProps}>
          <TooltipHelperLabel label={label} />
        </TooltipContent>
      ) : (
        <></>
      )}
    </Tooltip>
  )
}

interface TooltipHelperLabelProps {
  label: TooltipHelperProps["label"]
}
const TooltipHelperLabel: React.FC<TooltipHelperLabelProps> = (props) => {
  const { label } = props

  const resolvedLabel = typeof label === "function" ? label() : label
  return typeof resolvedLabel === "string" ? <p>{resolvedLabel}</p> : <>{resolvedLabel}</>
}
