import { TIMEZONE_DEFAULT } from "@repo/models/I18n"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { playwright } from "@vitest/browser-playwright"
import type { PluginOption } from "vite"
import type { BrowserConfigOptions } from "vitest/node"
import { defineConfig, defineProject } from "vitest/config"

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"

process.env["TZ"] = TIMEZONE_DEFAULT

const getTestPlugins = (): PluginOption[] => {
  return [tailwindcss(), react({ compiler: true })]
}

const getBrowserConfiguration = (
  options: { screenshotFailures?: boolean } = {},
): BrowserConfigOptions => {
  const { screenshotFailures = true } = options

  return {
    enabled: true,
    provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
    headless: true,
    instances: [{ browser: "chromium" }],
    screenshotFailures,
  }
}

/**
 * @see https://github.com/vitest-dev/vitest/issues/9437
 */
const IS_TEST_FILE_ISOLATED = false

export default defineConfig({
  test: {
    projects: [
      defineProject({
        plugins: getTestPlugins(),
        test: {
          name: "unit",
          include: ["src/**/*.test.{ts,tsx}"],
          isolate: IS_TEST_FILE_ISOLATED,
          browser: getBrowserConfiguration({ screenshotFailures: false }),
        },
      }),
      defineProject({
        plugins: [...getTestPlugins(), storybookTest()],
        test: {
          name: "storybook",
          isolate: IS_TEST_FILE_ISOLATED,
          browser: getBrowserConfiguration(),
          setupFiles: ["vitest.setup.ts"],
        },
      }),
    ],
  },
})
