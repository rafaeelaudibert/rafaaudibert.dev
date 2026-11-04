import { GITHUB_USER, POSTHOG_REPO } from "../data/work"

const repo = new URL(POSTHOG_REPO).pathname.slice(1)
const query = `repo:${repo} is:pr is:merged author:${GITHUB_USER}`

/** Shown when GitHub can't be reached at build time. */
const FALLBACK_LABEL = "1,000+"

/** GitHub's search results for the merged pull requests, as a page people can open. */
export const mergedPrsUrl = `${POSTHOG_REPO}/pulls?q=${encodeURIComponent(
  `is:pr is:merged author:${GITHUB_USER}`
)}`

/**
 * Rounded down to the hundred, so the "+" stays true: 1,007 is "1,000+" and
 * 1,160 is "1,100+".
 */
export const formatMergedPrs = (count: number) =>
  `${(Math.floor(count / 100) * 100).toLocaleString("en-US")}+`

let cached: Promise<string> | undefined

/**
 * Asks GitHub's search API how many pull requests are merged, once per build
 * (pages are static, so this never runs per visit). Unauthenticated search
 * allows 10 requests a minute per IP, which shared build machines can use up,
 * so GITHUB_TOKEN is sent when it is set. Any failure falls back to "1,000+"
 * rather than failing the build.
 */
export function getMergedPrsLabel(): Promise<string> {
  cached ??= fetchMergedPrsLabel()
  return cached
}

async function fetchMergedPrsLabel(): Promise<string> {
  const token = import.meta.env.GITHUB_TOKEN
  try {
    const response = await fetch(
      `https://api.github.com/search/issues?per_page=1&q=${encodeURIComponent(query)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "rafaaudibert.dev build",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(10_000),
      }
    )
    if (!response.ok) throw new Error(`GitHub search returned ${response.status}`)

    const { total_count } = (await response.json()) as { total_count: unknown }
    if (typeof total_count !== "number") throw new Error("GitHub search returned no total_count")

    return formatMergedPrs(total_count)
  } catch (error) {
    console.warn(`[merged-prs] Showing ${FALLBACK_LABEL}: ${error}`)
    return FALLBACK_LABEL
  }
}
