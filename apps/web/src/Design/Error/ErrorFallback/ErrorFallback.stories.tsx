import { expect, fn } from "storybook/test"
import { preview } from "../../../../.storybook/preview.tsx"
import { ErrorFallback as ErrorFallbackComponent } from "./ErrorFallback.tsx"

const meta = preview.meta({
  title: "Design/Error/ErrorFallback",
  component: ErrorFallbackComponent,
})
export default meta

export const ErrorFallback = meta.story({
  args: {
    reset: fn(),
    error: new Error("Server error"),
  },
})
ErrorFallback.test("should retry when clicking try again", async ({ canvas, userEvent, args }) => {
  // Arrange - Given
  const button = await canvas.findByRole("button", { name: "Réessayer" })

  // Act - When
  await userEvent.click(button)

  // Assert - Then
  await expect(args.reset).toHaveBeenCalled()
})
