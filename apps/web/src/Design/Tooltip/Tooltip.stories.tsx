import { expect, within } from "storybook/test"
import { preview } from "../../../.storybook/preview.tsx"
import { Button } from "../Button/Button.tsx"
import { Tooltip, TooltipContent, TooltipHelper, TooltipTrigger } from "./Tooltip.tsx"

const meta = preview.meta({
  title: "Design/Tooltip",
  parameters: {
    layout: "centered",
  },
})
export default meta

export const Hover = meta.story({
  render: () => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Tooltip content</p>
        </TooltipContent>
      </Tooltip>
    )
  },
})
Hover.test("should show the tooltip on hover", async ({ canvas, canvasElement, userEvent }) => {
  // Arrange - Given
  const trigger = await canvas.findByRole("button", { name: "Hover me" })
  const body = within(canvasElement.ownerDocument.body)

  // Act - When
  await userEvent.hover(trigger)

  // Assert - Then
  const output = await body.findByRole("tooltip")
  await expect(output).toHaveTextContent("Tooltip content")
})

export const Helper = meta.story({
  render: () => {
    return (
      <TooltipHelper label="Helper label">
        <Button>Helper trigger</Button>
      </TooltipHelper>
    )
  },
})
Helper.test("should show the label on hover", async ({ canvas, canvasElement, userEvent }) => {
  // Arrange - Given
  const trigger = await canvas.findByRole("button", { name: "Helper trigger" })
  const body = within(canvasElement.ownerDocument.body)

  // Act - When
  await userEvent.hover(trigger)

  // Assert - Then
  const output = await body.findByRole("tooltip")
  await expect(output).toHaveTextContent("Helper label")
})
