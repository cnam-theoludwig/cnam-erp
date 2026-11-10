import { Link } from "@tanstack/react-router"
import { expect, fn } from "storybook/test"
import { preview } from "../../../.storybook/preview.tsx"
import { Button } from "./Button.tsx"

const meta = preview.meta({
  title: "Design/Button",
  component: Button,
  args: { onClick: fn() },
})
export default meta

export const Component = meta.story({
  args: {
    children: "Button",
  },
})
Component.test("should trigger `onClick` when clicked", async ({ canvas, userEvent, args }) => {
  // Arrange - Given
  const button = await canvas.findByRole("button", { name: "Button" })

  // Act - When
  await userEvent.click(button)

  // Assert - Then
  await expect(args.onClick).toHaveBeenCalled()
})

export const Variants = meta.story({
  render: (args) => {
    return (
      <div className="flex items-center gap-4">
        <Button variant="primary" {...args}>
          primary
        </Button>
        <Button variant="ghost" {...args}>
          ghost
        </Button>
        <Button variant="link" {...args}>
          link
        </Button>
      </div>
    )
  },
})

export const Disabled = meta.story({
  args: {
    disabled: true,
    children: "Disabled Button",
  },
})
Disabled.test("should not trigger `onClick` when disabled", async ({ canvas, args }) => {
  // Arrange - Given
  const button = await canvas.findByRole("button", { name: "Disabled Button" })

  // Act - When
  button.click()

  // Assert - Then
  await expect(button).toBeDisabled()
  await expect(args.onClick).not.toHaveBeenCalled()
})

export const Loading = meta.story({
  args: {
    isLoading: true,
    children: "Loading Button",
  },
})
Loading.test("should show a spinner and disable the button while loading", async ({ canvas }) => {
  // Arrange - Given
  const button = await canvas.findByRole("button", { name: /Loading Button/u })

  // Act - When
  const output = await canvas.findByRole("status")

  // Assert - Then
  await expect(output).toBeVisible()
  await expect(button).toBeDisabled()
})

export const AsChildLink = meta.story({
  render: (args) => {
    return (
      <Button {...args} asChild>
        <Link to="/user">Go to user</Link>
      </Button>
    )
  },
})
AsChildLink.test("should render the child link instead of a button", async ({ canvas }) => {
  // Arrange - Given
  const name = "Go to user"

  // Act - When
  const output = await canvas.findByRole("link", { name })

  // Assert - Then
  const expected = "/user"
  await expect(output).toHaveAttribute("href", expected)
})
