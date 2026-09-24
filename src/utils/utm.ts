import { site } from "../data/site"

/**
 * Adds UTM parameters to an outbound link so referrals from this site show up
 * as such in the destination's analytics.
 *
 * - source is always this domain, medium is "referral"
 * - campaign is the page the link sits on ("home", "blog", "resume", ...)
 * - content names the specific link, when the caller gives one
 *
 * Only http(s) URLs to other hosts are tagged; links to this site, mailto and
 * relative paths come back unchanged, as does a URL that already carries UTMs.
 */
export function withUtm(href: string, { page, content }: { page: string; content?: string }): string {
  if (!/^https?:\/\//i.test(href)) return href

  let url: URL
  try {
    url = new URL(href)
  } catch {
    return href
  }
  if (url.hostname === site.domain || url.hostname.endsWith(`.${site.domain}`)) return href
  if ([...url.searchParams.keys()].some((k) => k.startsWith("utm_"))) return href

  url.searchParams.set("utm_source", site.domain)
  url.searchParams.set("utm_medium", "referral")
  url.searchParams.set("utm_campaign", page)
  if (content) url.searchParams.set("utm_content", content)
  return url.toString()
}

/** "/" -> "home", "/blog/foo/" -> "blog-foo" */
export function utmPageFromPath(pathname: string): string {
  const slug = pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-")
  return slug || "home"
}
