import { I18N_LOCALE_DEFAULT } from "@repo/models/I18n"
import addonA11y from "@storybook/addon-a11y"
import addonDocs from "@storybook/addon-docs"
import addonVitest from "@storybook/addon-vitest"
import { definePreview } from "@storybook/tanstack-react"
import {
  QueryClient,
  QueryClientProvider,
  queryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { IntlProvider } from "use-intl"
import { Toaster } from "../src/Design/Toast/Toaster.tsx"
import { getIntlConfig } from "../src/i18n/i18n.ts"
import "../src/styles.css"

const queryClient = new QueryClient()

interface IntlProviderDecoratorProps extends React.PropsWithChildren {
  now?: Date
}
const IntlProviderDecorator: React.FC<IntlProviderDecoratorProps> = (props) => {
  const { children, now } = props

  const i18nQuery = useSuspenseQuery(
    queryOptions({
      queryKey: ["i18n"],
      queryFn: async () => {
        return await getIntlConfig(I18N_LOCALE_DEFAULT)
      },
    }),
  )

  return (
    <IntlProvider {...i18nQuery.data} now={now}>
      {children}
    </IntlProvider>
  )
}

export const preview = definePreview({
  addons: [addonA11y(), addonVitest(), addonDocs()],
  parameters: {
    a11y: {
      test: "error",
      options: { iframes: false, resultTypes: ["violations", "incomplete"] },
    },
    controls: {
      disableSaveFromUI: true,
      matchers: {
        color: /(background|color)$/iu,
        date: /date$/iu,
      },
    },
  },
  decorators: [
    (Story, context) => {
      return (
        <QueryClientProvider client={queryClient}>
          <IntlProviderDecorator now={context.parameters["intlNow"]}>
            <Toaster key={context.id} />

            <Story />
          </IntlProviderDecorator>
        </QueryClientProvider>
      )
    },
  ],
  beforeEach: () => {
    toast.dismiss()
  },
})

export default preview
