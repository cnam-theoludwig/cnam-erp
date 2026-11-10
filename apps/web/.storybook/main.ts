import { defineMain } from "@storybook/tanstack-react/node"

export default defineMain({
  framework: "@storybook/tanstack-react",
  stories: ["../src/**/*.stories.tsx"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-vitest", "@storybook/addon-docs"],
  features: {
    experimentalTestSyntax: true,
  },
  core: {
    disableTelemetry: true,
  },
})
