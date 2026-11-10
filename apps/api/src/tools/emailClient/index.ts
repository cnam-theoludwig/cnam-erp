import type { EmailClient } from "./EmailClient.ts"
import { EmailSmtpClient } from "./EmailSmtpClient.ts"

let currentClient: EmailClient | null = null

const getDefaultClient = (): EmailClient => {
  return new EmailSmtpClient()
}

export const emailClient = {
  get current(): EmailClient {
    if (currentClient == null) {
      currentClient = getDefaultClient()
    }
    return currentClient
  },
}

export const setEmailClient = (client: EmailClient): void => {
  currentClient = client
}

export const restoreEmailClient = (): void => {
  currentClient = null
}

export type { EmailClient, SendEmailInput } from "./EmailClient.ts"
