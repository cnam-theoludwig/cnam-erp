import type { EmailInput, EmailOutput } from "@repo/models/Email"

export interface SendEmailInput extends EmailOutput {
  toEmail: EmailInput["toEmail"]
}

export interface EmailClient {
  send(input: SendEmailInput): Promise<void>
}
