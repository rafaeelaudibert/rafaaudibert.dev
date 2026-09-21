import type { APIRoute } from "astro"
import {
  getBackgroundContent,
  EDUCATION_AND_ACHIEVEMENTS,
  PAST_EXPERIENCES,
  TECHNOLOGIES,
  LANGUAGES,
} from "../data/resume"
import { getCollection } from "astro:content"
import { site, SOCIAL_LINKS } from "../data/site"

const blogposts = (await getCollection("blog")).sort(
  (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
)

const getLlmsTxt = (siteUrl: URL) =>
  `
# ${site.domain}

> ${site.name}: ${site.tagline}

## About me

### Background
${getBackgroundContent().join("\n")}

### Past Experiences
${PAST_EXPERIENCES.map(
  (experience) =>
    `- ${experience.company} (${experience.startDate} - ${experience.endDate}): ${experience.role}`
).join("\n")}

### Education and Achievements
${EDUCATION_AND_ACHIEVEMENTS.map(
  (education) => `${education.year}: ${education.description}`
).join("\n")}

### Technologies I worked with
${TECHNOLOGIES.map(
  (technology) => `${technology.type}: ${technology.technologies.join(", ")}`
).join("\n")}

### Languages I speak
${LANGUAGES.map((language) => `${language.language}: (${language.level})`).join(
  "\n"
)}

## Website content
- [Blog](${siteUrl.origin}/blog): My blog posts
${blogposts
  .map(
    (post) =>
      `  - [${post.data.title}](${siteUrl.origin}/blog/${post.id}): ${post.data.title}`
  )
  .join("\n")}	
- [Resume](${
    siteUrl.origin
  }/resume): A little bit about me, my background, my past experiences, and my skills
- [Changelog](${
    siteUrl.origin
  }/changelog): All the cools things that happened in my life
- [MCP server](${
    siteUrl.origin
  }/mcp): Connect an AI assistant to this site over the Model Context Protocol (Streamable HTTP, no auth)

## External links
${SOCIAL_LINKS.map((link) => `- [${link.label}](${link.href}): ${link.description}`).join("\n")}
`.trim()

export const GET: APIRoute = ({ site: siteUrl }) =>
  new Response(getLlmsTxt(siteUrl!), {
    headers: { "Content-Type": "text/plain" },
  })
