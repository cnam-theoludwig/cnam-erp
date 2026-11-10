import type { EmailClient, SendEmailInput } from "./EmailClient.ts"
import { restoreEmailClient, setEmailClient } from "./index.ts"

export class EmailFakeClient implements EmailClient {
  private readonly sentEmails: SendEmailInput[] = []

  public static fake(): EmailFakeClient {
    const client = new EmailFakeClient()
    setEmailClient(client)
    return client
  }

  public static restore(): void {
    restoreEmailClient()
  }

  public async send(input: SendEmailInput): Promise<void> {
    this.sentEmails.push(input)
  }

  public getSentEmails(): readonly SendEmailInput[] {
    return this.sentEmails
  }
}
