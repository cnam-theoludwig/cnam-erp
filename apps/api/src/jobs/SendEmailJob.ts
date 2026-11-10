import { Job } from "@boringnode/queue"
import type { JobOptions } from "@boringnode/queue/types"
import type { EmailInput, EmailOutput, EmailSend } from "@repo/models/Email"
import { EmailInputZodObject } from "@repo/models/Email"
import { API_KEY, API_KEY_HEADER_NAME, WEB_URL } from "@repo/utils/configuration"
import ky from "ky"
import { emailClient } from "../tools/emailClient/index.ts"

const getEmail = async (input: EmailSend): Promise<EmailOutput> => {
  return await ky
    .post<EmailOutput>(`${WEB_URL}/api/email`, {
      json: input,
      headers: {
        [API_KEY_HEADER_NAME]: API_KEY,
      },
    })
    .json()
}

export class SendEmailJob extends Job<EmailInput> {
  public static override options: JobOptions = {
    name: "SendEmailJob",
    maxRetries: 3,
    removeOnComplete: true,
    removeOnFail: true,
  }

  public async execute(): Promise<void> {
    const input = EmailInputZodObject.parse(this.payload)
    const email = await getEmail(input)
    await emailClient.current.send({ toEmail: input.toEmail, ...email })
  }
}

export default SendEmailJob
