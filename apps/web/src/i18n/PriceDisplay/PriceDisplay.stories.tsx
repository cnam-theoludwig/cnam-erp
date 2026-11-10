import { expect } from "storybook/test"
import { preview } from "../../../.storybook/preview.tsx"
import { PriceDisplay } from "./PriceDisplay.tsx"

const meta = preview.meta({
  title: "i18n/PriceDisplay",
  component: PriceDisplay,
})
export default meta

export const Default = meta.story({
  args: {
    price: { cents: 110_00, currency: "EUR" },
  },
})

Default.test("should render the amount in major units with its currency", async ({ canvas }) => {
  // Arrange - Given
  const expected = "110,00 €"

  // Act - When
  const output = await canvas.findByText(expected)

  // Assert - Then
  await expect(output).toBeVisible()
})

export const WithCents = meta.story({
  args: {
    price: { cents: 19_99, currency: "EUR" },
  },
})

WithCents.test("should keep the cents of the amount", async ({ canvas }) => {
  // Arrange - Given
  const expected = "19,99 €"

  // Act - When
  const output = await canvas.findByText(expected)

  // Assert - Then
  await expect(output).toBeVisible()
})

export const Zero = meta.story({
  args: {
    price: { cents: 0, currency: "EUR" },
  },
})

Zero.test("should render a zero amount", async ({ canvas }) => {
  // Arrange - Given
  const expected = "0,00 €"

  // Act - When
  const output = await canvas.findByText(expected)

  // Assert - Then
  await expect(output).toBeVisible()
})
