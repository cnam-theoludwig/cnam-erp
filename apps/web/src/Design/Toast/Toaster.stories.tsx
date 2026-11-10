import { toast } from "sonner"
import { expect, within } from "storybook/test"
import { preview } from "../../../.storybook/preview.tsx"
import { Button } from "../Button/Button.tsx"

const meta = preview.meta({
  title: "Design/Toast",
  parameters: {
    layout: "centered",
  },
})
export default meta

export const SuccessToast = meta.story({
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.success("Success!", { duration: Infinity })
        }}
      >
        Toast Success
      </Button>
    )
  },
})
SuccessToast.test("should show success toast", async ({ canvas, canvasElement, userEvent }) => {
  // Arrange - Given
  const button = await canvas.findByText("Toast Success")
  const body = within(canvasElement.ownerDocument.body)

  // Act - When
  await userEvent.click(button)

  // Assert - Then
  const toasts = await body.findAllByText("Success!")
  await expect(toasts.length).toBeGreaterThan(0)
})

export const ErrorToast = meta.story({
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.error("Error!", { duration: Infinity })
        }}
      >
        Toast Error
      </Button>
    )
  },
})
ErrorToast.test("should show error toast", async ({ canvas, canvasElement, userEvent }) => {
  // Arrange - Given
  const button = await canvas.findByText("Toast Error")
  const body = within(canvasElement.ownerDocument.body)

  // Act - When
  await userEvent.click(button)

  // Assert - Then
  const toasts = await body.findAllByText("Error!")
  await expect(toasts.length).toBeGreaterThan(0)
})

export const LoadingToast = meta.story({
  render: () => {
    return (
      <Button
        onClick={() => {
          toast.promise(
            async () => {
              return await new Promise<void>((resolve) => {
                setTimeout(() => {
                  resolve()
                }, 2_000)
              })
            },
            {
              loading: "Loading...",
              success: "Loaded!",
            },
          )
        }}
      >
        Toast Loading
      </Button>
    )
  },
})
LoadingToast.test("should show loading toast", async ({ canvas, canvasElement, userEvent }) => {
  // Arrange - Given
  const button = await canvas.findByText("Toast Loading")
  const body = within(canvasElement.ownerDocument.body)

  // Act - When
  await userEvent.click(button)

  // Assert - Then
  const toasts = await body.findAllByText("Loading...")
  await expect(toasts.length).toBeGreaterThan(0)
})
