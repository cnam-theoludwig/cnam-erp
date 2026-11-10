import { prettyMilliseconds } from "./date.ts"

export const noop = (): void => {}

export const assertUnreachable = (value: never): never => {
  throw new Error(`Unreachable value: ${String(value)}`)
}

export interface HandleJobInput<T> {
  handler: () => Promise<{ additionalInformation?: string; result?: T } | void>
  name: string
}

export interface JobOutcome<T = undefined> {
  result: T | undefined
  error?: unknown
}

export const handleJob = async <T>(input: HandleJobInput<T>): Promise<JobOutcome<T>> => {
  console.log(`[${new Date().toString()}] ${input.name}...`)
  const beforeTimeMs = performance.now()
  try {
    const output = await input.handler()
    const afterTimeMs = performance.now()
    const elapsedTimeMs = afterTimeMs - beforeTimeMs
    console.log(
      `[${new Date().toString()}] ${input.name} done in ${prettyMilliseconds(elapsedTimeMs)}${
        output?.additionalInformation == null ? "" : ` (${output.additionalInformation})`
      }`,
    )
    console.log()
    return { result: output?.result }
  } catch (error) {
    console.error(`[${new Date().toString()}] ${input.name} Error:`)
    console.error(error)
    return { result: undefined, error }
  }
}
