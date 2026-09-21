export const site = {
  name: "Rafa Audibert",
  fullName: "Rafael Baldasso Audibert",
  tagline: "Software Engineer based in Porto Alegre, Brazil",
  description: "The personal site of Rafa Audibert",
  location: "Porto Alegre, Brazil",
  url: "https://rafaaudibert.dev",
  domain: "rafaaudibert.dev",
  twitter: "@rafaaudibert",
  locale: "en_US",
} as const;

export type Site = typeof site;

/** Where else to find me. Shared by the footer, llms.txt and the MCP server. */
export const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/rafaeelaudibert", description: "My GitHub profile" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rbaudibert/", description: "My LinkedIn profile" },
  { label: "Instagram", href: "https://www.instagram.com/rafaaudibeert/", description: "My Instagram profile" },
  { label: "PostHog", href: "https://posthog.com/community/profiles/32207", description: "My profile on PostHog's team website" },
] as const;
