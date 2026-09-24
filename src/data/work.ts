// Plain data only: like resume.ts this may be read by the Worker as well as
// the site. Pull requests on github.com/PostHog/posthog worth pointing at.

export const POSTHOG_REPO = "https://github.com/PostHog/posthog"

/** Merged pull requests on PostHog/posthog by me, and when that was counted. */
export const MERGED_PRS = { count: 863, asOf: "September 2026", since: "November 2024" }

export const prUrl = (number: number) => `${POSTHOG_REPO}/pull/${number}`

/** Pull requests the homepage prose links to, by key. */
export const PRS = {
  reauth: 104809,
  cimd: 52324,
  oidc: 99353,
  emptyStates: 74452,
  partners: 74089,
  toolbar: 69093,
  campaigns: 67968,
  sidebar: 41407,
  churn: 36812,
  webVitals: 27479,
  mcpApps: 46063,
  mcpHints: 59126,
  mcpHealth: 61960,
} as const
