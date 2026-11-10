import { useEffect, useLayoutEffect, useRef, useState } from "react"

const useDebouncedRippleCleanUp = (
  rippleCount: number,
  duration: number,
  cleanUpFunction: () => void,
): void => {
  useLayoutEffect(() => {
    let bounce: ReturnType<typeof setTimeout> | undefined
    if (rippleCount > 0) {
      clearTimeout(bounce)

      bounce = setTimeout(() => {
        cleanUpFunction()
        clearTimeout(bounce)
      }, duration * 4)
    }

    return () => {
      return clearTimeout(bounce)
    }
  }, [rippleCount, duration, cleanUpFunction])
}

export interface RippleProps {
  /**
   * The color of the ripple effect.
   */
  color?: string

  /**
   * The duration of the ripple animation in milliseconds.
   */
  duration?: number
}

interface RippleItem {
  x: number
  y: number
  size: number
}

export const Ripple: React.FC<RippleProps> = (props) => {
  const { duration = 1_000, color = "rgb(229, 231, 235)" } = props
  const [rippleArray, setRippleArray] = useState<RippleItem[]>([])

  useDebouncedRippleCleanUp(rippleArray.length, duration, () => {
    setRippleArray([])
  })

  const rippleContainerReference = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const rippleContainer = rippleContainerReference.current
    const rippleTarget = rippleContainer?.parentElement
    if (rippleContainer == null || rippleTarget == null) {
      return undefined
    }

    const addRipple = (event: MouseEvent): void => {
      const isPrimaryButton = event.button === 0
      if (!isPrimaryButton) {
        return
      }

      const rippleContainerRectangle = rippleContainer.getBoundingClientRect()
      const size = Math.max(rippleContainerRectangle.width, rippleContainerRectangle.height)
      const newRipple: RippleItem = {
        x: event.clientX - rippleContainerRectangle.x - size / 2,
        y: event.clientY - rippleContainerRectangle.y - size / 2,
        size,
      }
      setRippleArray((previousRippleArray) => {
        return [...previousRippleArray, newRipple]
      })
    }

    rippleTarget.addEventListener("mousedown", addRipple)
    return () => {
      rippleTarget.removeEventListener("mousedown", addRipple)
    }
  }, [])

  return (
    <span
      role="presentation"
      ref={rippleContainerReference}
      className="pointer-events-none absolute inset-0 block overflow-hidden"
    >
      {rippleArray.map((ripple, index) => {
        return (
          <span
            key={"span" + index}
            className="absolute block rounded-full opacity-75"
            style={{
              transform: "scale(0)",
              backgroundColor: color,
              animationName: "ripple",
              animationDuration: `${duration}ms`,
              top: ripple.y,
              left: ripple.x,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        )
      })}
    </span>
  )
}
