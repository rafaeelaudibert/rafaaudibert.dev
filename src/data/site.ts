export const site = {
  name: "Rafa Audibert",
  tagline: "Software Engineer based in Porto Alegre, Brazil",
  description: "The personal site of Rafa Audibert",
  url: "https://rafaaudibert.dev",
  domain: "rafaaudibert.dev",
  twitter: "@rafaaudibert",
  locale: "en_US",
} as const;

export type Site = typeof site;
