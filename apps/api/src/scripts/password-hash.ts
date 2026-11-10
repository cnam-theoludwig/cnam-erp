import { createInterface } from "node:readline/promises"
import { passwordHash } from "@repo/utils/crypto"

const readline = createInterface({ input: process.stdin, output: process.stderr })
const password = await readline.question("Password: ")
readline.close()

if (password.length === 0) {
  console.error("Password is required.")
  process.exit(1)
}

const hash = await passwordHash(password)
console.log(hash)
