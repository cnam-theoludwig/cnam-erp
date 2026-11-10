import { expect } from "storybook/test"
import { preview } from "../../../.storybook/preview.tsx"
import { Spinner as SpinnerComponent } from "./Spinner.tsx"

const meta = preview.meta({
  title: "Design/Spinner",
  component: SpinnerComponent,
})
export default meta

export const Spinner = meta.story({})
Spinner.test("should announce the loading status", async ({ canvas }) => {
  // Arrange - Given
  const name = "Chargement..."

  // Act - When
  const output = await canvas.findByRole("status", { name })

  // Assert - Then
  await expect(output).toBeVisible()
})
