// Plain data only: like resume.ts this may be read by the Worker as well as
// the site. Pull requests on github.com/PostHog/posthog worth pointing at.

export const POSTHOG_REPO = "https://github.com/PostHog/posthog"

/** Merged pull requests on PostHog/posthog by me, and when that was counted. */
export const MERGED_PRS = { count: 863, asOf: "September 2026", since: "November 2024" }

export const prUrl = (number: number) => `${POSTHOG_REPO}/pull/${number}`

/** A handful across two years, newest first. */
export const SELECTED_PRS = [
  { number: 104809, label: "Gate sensitive writes on the backend and retry after re-auth" },
  { number: 99353, label: "Serve conformant OIDC discovery and ID tokens" },
  { number: 74452, label: "Setup empty states for flags, experiments and more" },
  { number: 74089, label: "Authenticate provisioning partners as OAuth clients" },
  { number: 69093, label: "Split the toolbar into a tiny loader plus a code-split app" },
  { number: 67968, label: "Organisation-level product push campaigns" },
  { number: 41407, label: "The custom sidebar" },
  { number: 36812, label: "New, expansion, contraction and churn revenue" },
  { number: 27479, label: "The Core Web Vitals view" },
]

/** The MCP work at PostHog: apps that render inside MCP clients, and hints in the app. */
export const MCP_PRS = [
  { number: 46063, label: "Create MCP apps" },
  { number: 59126, label: "In-app MCP hints" },
  { number: 61960, label: "Health checks as MCP tools" },
]
