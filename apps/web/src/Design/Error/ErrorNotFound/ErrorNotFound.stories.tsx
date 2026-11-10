import { expect } from "storybook/test"
import { preview } from "../../../../.storybook/preview.tsx"
import { ErrorNotFound as ErrorNotFoundComponent } from "./ErrorNotFound.tsx"

const meta = preview.meta({
  title: "Design/Error/ErrorNotFound",
  component: ErrorNotFoundComponent,
})
export default meta

export const ErrorNotFound = meta.story({})
ErrorNotFound.test("should link back to the home page", async ({ canvas }) => {
  // Arrange - Given
  const name = "Retour à la page d'accueil"

  // Act - When
  const output = await canvas.findByRole("link", { name })

  // Assert - Then
  const expected = "/"
  await expect(output).toHaveAttribute("href", expected)
})
