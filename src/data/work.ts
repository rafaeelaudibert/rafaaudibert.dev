// Plain data only: like resume.ts this may be read by the Worker as well as
// the site. Pull requests on github.com/PostHog/posthog worth pointing at.

export const POSTHOG_REPO = "https://github.com/PostHog/posthog"
export const GITHUB_USER = "rafaeelaudibert"

/** When I started merging into PostHog/posthog. The count itself comes from GitHub at build time (src/utils/mergedPrs.ts). */
export const MERGED_PRS_SINCE = "November 2024"

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
  webVitals: 27479,
  mcpApps: 46063,
  enterpriseAuth: 64747,
  partnerRateLimits: 83935,
  hog: 124430,
} as const
