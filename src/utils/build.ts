import { execSync } from "node:child_process"

const REPO = "https://github.com/rafaeelaudibert/rafaaudibert.dev"

/**
 * The commit being built. Workers Builds sets WORKERS_CI_COMMIT_SHA; local
 * builds ask git. Undefined when neither knows, and the footer leaves it out.
 */
function currentCommit(): string | undefined {
  const fromCi = process.env.WORKERS_CI_COMMIT_SHA
  if (fromCi) return fromCi
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
  } catch {
    return undefined
  }
}

const sha = currentCommit()
const builtAt = new Date()

/** When and from which commit this build ran, read once per build. */
export const BUILD = {
  builtAt,
  builtAtLabel: builtAt.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }),
  commit: sha ? { short: sha.slice(0, 7), url: `${REPO}/commit/${sha}` } : undefined,
}
