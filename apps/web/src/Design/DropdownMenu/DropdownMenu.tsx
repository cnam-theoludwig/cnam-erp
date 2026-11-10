import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"
import { CheckIcon } from "lucide-react"
import { useCallback, useRef } from "react"
import { classNames } from "../../configuration.ts"

export interface DropdownMenuProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Root
> {}
export const DropdownMenu: React.FC<DropdownMenuProps> = (props) => {
  const { modal = false, ...rest } = props
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" modal={modal} {...rest} />
}

export interface DropdownMenuTriggerProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Trigger
> {}
export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = (props) => {
  const isTouchRef = useRef(false)
  const allowNextPointerDownRef = useRef(false)

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "touch" && !allowNextPointerDownRef.current) {
      isTouchRef.current = true
      event.preventDefault()
    }
    allowNextPointerDownRef.current = false
  }, [])

  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchRef.current) {
      isTouchRef.current = false
      allowNextPointerDownRef.current = true
      const trigger = event.currentTarget
      trigger.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }))
    }
  }, [])

  return (
    <DropdownMenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      {...props}
    />
  )
}

export interface DropdownMenuContentProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Content
> {
  align?: "start" | "center" | "end"
  sideOffset?: number
}
export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = (props) => {
  const { className, align = "start", sideOffset = 4, ...rest } = props

  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={classNames(
          "z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-(--radix-dropdown-menu-trigger-width) origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-background p-1 text-content-primary shadow-md ring-1 ring-border-subtle",
          "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className,
        )}
        {...rest}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

const DROPDOWN_MENU_ITEM_VARIANTS = ["default", "destructive"] as const
type DropdownMenuItemVariant = (typeof DROPDOWN_MENU_ITEM_VARIANTS)[number]

export interface DropdownMenuItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.Item
> {
  inset?: boolean
  variant?: DropdownMenuItemVariant
}
export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = (props) => {
  const { className, inset, variant = "default", ...rest } = props

  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={classNames(
        "group/dropdown-menu-item relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "data-inset:pl-8",
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        {
          "focus:bg-background-tint focus:text-content-primary": variant === "default",
          "text-state-error focus:bg-state-error/10 focus:text-state-error":
            variant === "destructive",
        },
        className,
      )}
      {...rest}
    />
  )
}

export interface DropdownMenuRadioGroupProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioGroup
> {}
export const DropdownMenuRadioGroup: React.FC<DropdownMenuRadioGroupProps> = (props) => {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

export interface DropdownMenuRadioItemProps extends React.ComponentProps<
  typeof DropdownMenuPrimitive.RadioItem
> {}
export const DropdownMenuRadioItem: React.FC<DropdownMenuRadioItemProps> = (props) => {
  const { className, children, ...rest } = props

  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={classNames(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
        "focus:bg-background-tint focus:text-content-primary",
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
        className,
      )}
      {...rest}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}
