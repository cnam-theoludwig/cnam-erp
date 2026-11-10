import { render, toPlainText } from "react-email"
import type { EmailOutput } from "@repo/models/Email"
import { EmailSendZodObject } from "@repo/models/Email"
import { API_KEY_HEADER_NAME } from "@repo/utils/configuration"
import { getIsApiKeyValid } from "@repo/utils/crypto"
import { createFileRoute } from "@tanstack/react-router"
import { EMAILS } from "../../../Email/_emails.ts"

export const Route = createFileRoute("/api/email/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!getIsApiKeyValid(request.headers.get(API_KEY_HEADER_NAME))) {
            return Response.json({ error: "Unauthorized" }, { status: 401 })
          }
          const { type, input } = EmailSendZodObject.parse(await request.json())
          const emailData = EMAILS[type] as {
            component: React.ComponentType<typeof input>
            getSubject: (props: typeof input) => Promise<string>
          }
          const Component = emailData.component
          const html = await render(<Component {...input} />)
          const output: EmailOutput = {
            html,
            plainText: toPlainText(html),
            subject: await emailData.getSubject(input),
          }
          return Response.json(output)
        } catch (error) {
          console.error("Error in email route:", error)
          return Response.json({ error: "Bad Request" }, { status: 400 })
        }
      },
    },
  },
})
