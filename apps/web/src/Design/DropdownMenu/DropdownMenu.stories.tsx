import { expect, fn, within } from "storybook/test"
import { preview } from "../../../.storybook/preview.tsx"
import { Button } from "../Button/Button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./DropdownMenu.tsx"

const meta = preview.meta({
  title: "Design/DropdownMenu",
  args: { onSelect: fn(), onValueChange: fn() },
})
export default meta

export const Items = meta.story({
  render: (args) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Open menu</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={args.onSelect}>Profile</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
})
Items.test(
  "should select an item of the opened menu",
  async ({ canvas, canvasElement, userEvent, args }) => {
    // Arrange - Given
    const trigger = await canvas.findByRole("button", { name: "Open menu" })
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(trigger)

    // Act - When
    await userEvent.click(await body.findByRole("menuitem", { name: "Profile" }))

    // Assert - Then
    await expect(args.onSelect).toHaveBeenCalled()
  },
)

export const RadioItems = meta.story({
  render: (args) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>Language</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value="fr-FR" onValueChange={args.onValueChange}>
            <DropdownMenuRadioItem value="en-GB">English</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="fr-FR">Français</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
})
RadioItems.test(
  "should check the current value and select another one",
  async ({ canvas, canvasElement, userEvent, args }) => {
    // Arrange - Given
    const trigger = await canvas.findByRole("button", { name: "Language" })
    const body = within(canvasElement.ownerDocument.body)
    await userEvent.click(trigger)

    // Act - When
    const current = await body.findByRole("menuitemradio", { name: "Français" })
    await userEvent.click(await body.findByRole("menuitemradio", { name: "English" }))

    // Assert - Then
    await expect(current).toHaveAttribute("aria-checked", "true")
    await expect(args.onValueChange).toHaveBeenCalledWith("en-GB")
  },
)
