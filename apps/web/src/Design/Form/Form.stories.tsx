import { Mail } from "lucide-react"
import { expect } from "storybook/test"
import { preview } from "../../../.storybook/preview.tsx"
import { FormField, FormFieldError, FormFieldLabel } from "./FormField.tsx"
import { FormInput } from "./FormInput.tsx"
import { FormInputGroup, FormInputGroupAddon, FormInputGroupInput } from "./FormInputGroup.tsx"
import { FormInputPassword } from "./FormInputPassword.tsx"

const meta = preview.meta({
  title: "Design/Form",
})
export default meta

export const Input = meta.story({
  render: () => {
    return (
      <FormField>
        <FormFieldLabel htmlFor="name">Name</FormFieldLabel>
        <FormInput id="name" placeholder="Name" />
      </FormField>
    )
  },
})
Input.test("should link the label to the input", async ({ canvas, userEvent }) => {
  // Arrange - Given
  const input = await canvas.findByLabelText("Name")

  // Act - When
  await userEvent.type(input, "Théo")

  // Assert - Then
  const expected = "Théo"
  await expect(input).toHaveValue(expected)
})

export const InputGroup = meta.story({
  render: () => {
    return (
      <FormField>
        <FormFieldLabel htmlFor="email">Email</FormFieldLabel>
        <FormInputGroup>
          <FormInputGroupAddon>
            <Mail />
          </FormInputGroupAddon>
          <FormInputGroupInput id="email" type="email" placeholder="Email" />
        </FormInputGroup>
      </FormField>
    )
  },
})

export const Password = meta.story({
  render: () => {
    return (
      <FormField>
        <FormFieldLabel htmlFor="password">Password</FormFieldLabel>
        <FormInputPassword id="password" defaultValue="secret-password" />
      </FormField>
    )
  },
})
Password.test("should reveal the password when toggled", async ({ canvas, userEvent }) => {
  // Arrange - Given
  const input = await canvas.findByLabelText("Password")
  const toggle = await canvas.findByRole("button", { name: "Afficher le mot de passe" })

  // Act - When
  await userEvent.click(toggle)

  // Assert - Then
  const expected = "text"
  await expect(input).toHaveAttribute("type", expected)
  await expect(await canvas.findByRole("button", { name: "Masquer le mot de passe" })).toBeVisible()
})

export const Invalid = meta.story({
  render: () => {
    return (
      <FormField data-invalid>
        <FormFieldLabel htmlFor="invalid-email">Email</FormFieldLabel>
        <FormInput id="invalid-email" aria-invalid defaultValue="not-an-email" />
        <FormFieldError errors={["Invalid email.", { message: "Invalid email." }, undefined]} />
      </FormField>
    )
  },
})
Invalid.test("should show each error message once", async ({ canvas }) => {
  // Arrange - Given
  const alert = await canvas.findByRole("alert")

  // Act - When
  const output = alert.textContent

  // Assert - Then
  const expected = "Invalid email."
  await expect(output).toBe(expected)
})
