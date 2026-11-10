import { beforeAll } from "vitest"
import { preview } from "./.storybook/preview.tsx"

beforeAll(preview.composed.beforeAll)
