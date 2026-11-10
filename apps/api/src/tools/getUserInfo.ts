import { UAParser } from "ua-parser-js"
import type { ORPCContext } from "../oRPC.ts"

interface GetUserInfoInput {
  context: ORPCContext
}

export const getUserInfo = async (input: GetUserInfoInput): Promise<UAParser.IResult> => {
  const { context } = input

  // https://docs.uaparser.dev/api/main/idata/with-client-hints.html
  const getHighEntropyValues =
    "Sec-CH-UA-Full-Version-List, Sec-CH-UA-Mobile, Sec-CH-UA-Model, Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Arch, Sec-CH-UA-Bitness, Sec-CH-UA-Form-Factors"
  context.resHeaders?.append("Accept-CH", getHighEntropyValues)
  context.resHeaders?.append("Critical-CH", getHighEntropyValues)

  const userInfo = await UAParser(context.reqHeaders).withClientHints()
  return userInfo
}
