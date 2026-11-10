import { NAME } from "@repo/utils/configuration"
import * as nodemailer from "nodemailer"
import { EMAIL_CONNECTION, EMAIL_USER } from "../../configuration.ts"
import type { EmailClient, SendEmailInput } from "./EmailClient.ts"

export class EmailSmtpClient implements EmailClient {
  private readonly transporter = nodemailer.createTransport(EMAIL_CONNECTION)

  public async send(input: SendEmailInput): Promise<void> {
    await this.transporter.sendMail({
      from: `"${NAME}" <${EMAIL_USER}>`,
      to: input.toEmail,
      subject: input.subject,
      html: input.html,
      text: input.plainText,
    })
  }
}
