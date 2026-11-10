import { preview } from "../../../../.storybook/preview.tsx"
import { Button } from "../../Button/Button.tsx"
import { ErrorLayout as ErrorLayoutComponent } from "./ErrorLayout.tsx"

const meta = preview.meta({
  title: "Design/Error/ErrorLayout",
  component: ErrorLayoutComponent,
})
export default meta

export const ErrorLayout = meta.story({
  args: {
    statusCode: 418,
    title: "I'm a teapot",
    description: "The server refuses to brew coffee because it is a teapot.",
    children: <Button className="mt-4">Get tea instead</Button>,
  },
})
