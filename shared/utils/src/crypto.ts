import { argon2 as argon2Callback, hash, randomBytes, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { API_KEY, PASSWORD_HASH_MEMORY_KIB, PASSWORD_HASH_MEMORY_KIB_MAX } from "./configuration.ts"

const argon2 = promisify(argon2Callback)

const ARGON2_ALGORITHM = "argon2id"
const ARGON2_VERSION = 0x13
const ARGON2_PASSES = 3
const ARGON2_PARALLELISM = 4
const ARGON2_SALT_LENGTH = 16
const ARGON2_TAG_LENGTH = 32
const ARGON2_PHC_SEGMENTS_COUNT = 6

const encodeBase64NoPadding = (buffer: Buffer): string => {
  return buffer.toString("base64").replaceAll("=", "")
}

const decodeBase64NoPadding = (value: string): Buffer => {
  return Buffer.from(value, "base64")
}

export const passwordHash = async (password: string): Promise<string> => {
  const salt = randomBytes(ARGON2_SALT_LENGTH)
  const tag = await argon2(ARGON2_ALGORITHM, {
    message: Buffer.from(password),
    nonce: salt,
    parallelism: ARGON2_PARALLELISM,
    tagLength: ARGON2_TAG_LENGTH,
    memory: PASSWORD_HASH_MEMORY_KIB,
    passes: ARGON2_PASSES,
  })
  const parameters = `m=${PASSWORD_HASH_MEMORY_KIB},t=${ARGON2_PASSES},p=${ARGON2_PARALLELISM}`
  return `$${ARGON2_ALGORITHM}$v=${ARGON2_VERSION}$${parameters}$${encodeBase64NoPadding(salt)}$${encodeBase64NoPadding(tag)}`
}

export const passwordVerify = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  try {
    const segments = hashedPassword.split("$")
    if (segments.length !== ARGON2_PHC_SEGMENTS_COUNT) {
      return false
    }
    const [, algorithm, versionPart, parametersPart, saltB64, tagB64] = segments
    if (
      algorithm !== ARGON2_ALGORITHM ||
      versionPart !== `v=${ARGON2_VERSION}` ||
      parametersPart == null ||
      saltB64 == null ||
      tagB64 == null
    ) {
      return false
    }
    const parameters = Object.fromEntries(
      parametersPart.split(",").map((entry) => {
        return entry.split("=")
      }),
    ) as { m?: string; t?: string; p?: string }
    const memory = Number(parameters.m)
    const passes = Number(parameters.t)
    const parallelism = Number(parameters.p)
    if (
      !Number.isInteger(memory) ||
      memory < 1 ||
      memory > PASSWORD_HASH_MEMORY_KIB_MAX ||
      !Number.isInteger(passes) ||
      passes < 1 ||
      passes > ARGON2_PASSES ||
      !Number.isInteger(parallelism) ||
      parallelism < 1 ||
      parallelism > ARGON2_PARALLELISM
    ) {
      return false
    }
    const salt = decodeBase64NoPadding(saltB64)
    const expectedTag = decodeBase64NoPadding(tagB64)
    const computedTag = await argon2(ARGON2_ALGORITHM, {
      message: Buffer.from(password),
      nonce: salt,
      parallelism,
      tagLength: expectedTag.length,
      memory,
      passes,
    })
    return timingSafeEqual(computedTag, expectedTag)
  } catch {
    return false
  }
}

export const passwordNeedsRehash = (hashedPassword: string): boolean => {
  const segments = hashedPassword.split("$")
  if (segments.length !== ARGON2_PHC_SEGMENTS_COUNT) {
    return true
  }
  const [, algorithm, versionPart, parametersPart] = segments
  if (
    algorithm !== ARGON2_ALGORITHM ||
    versionPart !== `v=${ARGON2_VERSION}` ||
    parametersPart == null
  ) {
    return true
  }
  return (
    parametersPart !== `m=${PASSWORD_HASH_MEMORY_KIB},t=${ARGON2_PASSES},p=${ARGON2_PARALLELISM}`
  )
}

export const hashSha256Hex = (data: string | Buffer): string => {
  return hash("sha256", data, "hex")
}

const API_KEY_HASH = Buffer.from(hashSha256Hex(API_KEY))

export const getIsApiKeyValid = (apiKey: string | null | undefined): boolean => {
  if (apiKey == null) {
    return false
  }
  return timingSafeEqual(Buffer.from(hashSha256Hex(apiKey)), API_KEY_HASH)
}
