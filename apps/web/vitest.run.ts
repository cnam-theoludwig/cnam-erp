import Bun from "bun"

const VITEST_COMMAND = ["bun", "run", "vitest", "run", ...process.argv.slice(2)]

const LOOPBACK_ONLY_NETWORK_COMMAND = [
  "unshare",
  "--net",
  "--map-root-user",
  "sh",
  "-c",
  'ip link set lo up && exec "$@"',
  "sh",
]

const getIsLoopbackOnlyNetworkAvailable = (): boolean => {
  try {
    return Bun.spawnSync([...LOOPBACK_ONLY_NETWORK_COMMAND, "true"]).exitCode === 0
  } catch {
    return false
  }
}

const command = getIsLoopbackOnlyNetworkAvailable()
  ? [...LOOPBACK_ONLY_NETWORK_COMMAND, ...VITEST_COMMAND]
  : VITEST_COMMAND

const subprocess = Bun.spawn(command, { stdio: ["inherit", "inherit", "inherit"] })
process.exit(await subprocess.exited)
