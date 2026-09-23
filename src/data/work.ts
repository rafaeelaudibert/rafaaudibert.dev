// Plain data only: like resume.ts this may be read by the Worker as well as
// the site. Bodies of work at PostHog, newest first, each with the pull
// requests that carry it on github.com/PostHog/posthog.

export const POSTHOG_REPO = "https://github.com/PostHog/posthog"

/** Merged pull requests on PostHog/posthog by me, and when that was counted. */
export const MERGED_PRS = { count: 863, asOf: "September 2026", since: "November 2024" }

export const prUrl = (number: number) => `${POSTHOG_REPO}/pull/${number}`

export interface WorkItem {
  period: string
  title: string
  summary: string
  prs: { number: number; label: string }[]
}

export const WORK: WorkItem[] = [
  {
    period: "Sep 2026",
    title: "Re-authentication that gets out of the way",
    summary:
      "Settings pages stopped asking for a password just for being opened. The backend now gates the writes that matter (passkeys, revoking OAuth apps, personal integrations), and a refused write reopens the prompt and retries itself once you're back in.",
    prs: [
      { number: 104809, label: "Gate sensitive writes on the backend" },
      { number: 104823, label: "Keep the write alive through SSO" },
      { number: 99491, label: "Resume after a passkey re-auth" },
    ],
  },
  {
    period: "Jun to Sep 2026",
    title: "PostHog as an OAuth 2.0 and OpenID Connect provider",
    summary:
      "Conformant OIDC discovery and ID tokens served from one host over two regions, enterprise-managed authorization for MCP clients, client-ID metadata documents, and login, signup and consent screens that frame the connection being made.",
    prs: [
      { number: 99353, label: "Conformant OIDC discovery and ID tokens" },
      { number: 64747, label: "Enterprise-managed authorization (ID-JAG)" },
      { number: 98561, label: "Login and signup around a pending connection" },
      { number: 101343, label: "OAuth screens aligned with login" },
    ],
  },
  {
    period: "Jul to Aug 2026",
    title: "Agentic provisioning for partners",
    summary:
      "An API through which partners such as Stripe provision PostHog for their own users. Partners authenticate as real OAuth clients, GitHub grants are scoped per partner, and rate limits run on Redis token buckets that fail open.",
    prs: [
      { number: 74089, label: "Partners as OAuth clients" },
      { number: 69857, label: "Partner-scoped GitHub grants" },
      { number: 83935, label: "Token-bucket rate limits" },
    ],
  },
  {
    period: "Jul to Sep 2026",
    title: "A first-run screen for every product",
    summary:
      "One shared setup empty state, then a rollout across flags, experiments, replay, surveys, error tracking, heatmaps, the CDP, alerts, notebooks, dashboards and more. When a product has data and the screen can't show, a modal introduces it instead.",
    prs: [
      { number: 72442, label: "The shared ProductEmptyState gate" },
      { number: 74452, label: "Flags, experiments and more" },
      { number: 95408, label: "Heatmaps" },
      { number: 100625, label: "Introduce the pushed product" },
    ],
  },
  {
    period: "Feb 2025 to Sep 2026",
    title: "Cross-selling and product pushes",
    summary:
      "Started with cross-sell buttons inside Web Analytics, grew into a monthly job that adds a product to your sidebar, a weighted candidate selector, and finally organisation-level campaigns with a cadence, adoption detection and an admin for the people who run them.",
    prs: [
      { number: 28410, label: "Cross-sell Web Vitals" },
      { number: 41942, label: "Monthly cross-sell job" },
      { number: 53516, label: "Weighted candidate selector" },
      { number: 67968, label: "Organisation product push campaigns" },
      { number: 93720, label: "Nav ads for Desktop, Slack, GitHub" },
    ],
  },
  {
    period: "Nov 2025 to Sep 2026",
    title: "A sidebar people can shape",
    summary:
      "A custom sidebar with a per-user product list, automatic additions from what colleagues use, a description and docs link on every entry, and then a flat-sidebar experiment with product shortcuts and Cmd+K surfaced in the nav.",
    prs: [
      { number: 41407, label: "The custom sidebar" },
      { number: 41934, label: "Products from colleagues" },
      { number: 92011, label: "Flat sidebar experiment" },
      { number: 103226, label: "Product shortcut buttons" },
    ],
  },
  {
    period: "Jan to Jun 2026",
    title: "MCP apps and hints",
    summary:
      "Interactive apps for feature flags, experiments and error tracking rendered inside MCP clients, served from Workers Static Assets. In-app hints that show how to do what you just did through your AI agent, and every health check exposed as an MCP tool.",
    prs: [
      { number: 46063, label: "Create MCP apps" },
      { number: 50099, label: "Feature flag apps" },
      { number: 51238, label: "Serve apps from Static Assets" },
      { number: 59126, label: "In-app MCP hints" },
      { number: 61960, label: "Health checks as MCP tools" },
    ],
  },
  {
    period: "Jul 2026",
    title: "A toolbar that loads in a kilobyte",
    summary:
      "The toolbar customers embed on their own sites shipped as one 10 MB IIFE. It became a 1 KB loader plus a code-split ESM app, with a module-boundary guard so the main app graph cannot leak back in. Earlier, a PII masking tool for session replay.",
    prs: [
      { number: 69093, label: "Loader plus code-split app" },
      { number: 69045, label: "Module-boundary guard" },
      { number: 40909, label: "PII masking" },
    ],
  },
  {
    period: "Mar to Dec 2025",
    title: "Revenue Analytics, built from scratch",
    summary:
      "A product for the revenue side of the data companies already send: currency conversion, MRR, ARPU, customer and subscription counts, new, expansion, contraction and churn revenue, revenue properties on persons and groups, and all of it queryable by PostHog AI.",
    prs: [
      { number: 29556, label: "Default currency" },
      { number: 37087, label: "MRR" },
      { number: 36812, label: "New, expansion, contraction, churn" },
      { number: 34807, label: "Revenue properties on persons" },
      { number: 38620, label: "Exposed to PostHog AI" },
    ],
  },
  {
    period: "Nov 2024 to Feb 2025",
    title: "Web Analytics and Web Vitals",
    summary:
      "My first months at PostHog: the Core Web Vitals view with path breakdowns, Web Vitals inside the toolbar, comparing against a previous period, conversion-goal-aware tables, sortable tables and a rework of the filters.",
    prs: [
      { number: 27479, label: "Core Web Vitals view" },
      { number: 27663, label: "Path breakdown" },
      { number: 28173, label: "Web Vitals in the toolbar" },
      { number: 26820, label: "Period comparison" },
      { number: 28647, label: "Sortable tables" },
    ],
  },
  {
    period: "2026",
    title: "Keeping the app on its feet",
    summary:
      "The weekly digest nobody was receiving, fixed and moved onto worker threads. A stylesheet loader that heals when the CSS stalls and reports when it fails, instead of painting a raw page. In-page translation no longer crashing whole scenes.",
    prs: [
      { number: 104657, label: "Weekly digest on worker threads" },
      { number: 96875, label: "Stylesheet recovery" },
      { number: 96866, label: "Translation crashes" },
    ],
  },
]
