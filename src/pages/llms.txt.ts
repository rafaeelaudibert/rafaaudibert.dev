import type { APIRoute } from "astro"
import {
  BACKGROUND_CONTENT,
  EDUCATION_AND_ACHIEVEMENTS,
  PAST_EXPERIENCES,
  TECHNOLOGIES,
  LANGUAGES,
} from "./resume.astro"
import { getCollection } from "astro:content"
import { site } from "../data/site"

const blogposts = (await getCollection("blog")).sort(
  (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
)

const getLlmsTxt = (siteUrl: URL) =>
  `
# ${site.domain}

> ${site.name}: ${site.tagline}

## About me

### Background
${BACKGROUND_CONTENT.join("\n")}

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
- [Blog](${siteUrl.href}/blog): My blog posts
${blogposts
  .map(
    (post) =>
      `  - [${post.data.title}](${siteUrl.href}/blog/${post.id}): ${post.data.title}`
  )
  .join("\n")}	
- [Resume](${
    siteUrl.href
  }/resume): A little bit about me, my background, my past experiences, and my skills
- [Changelog](${
    siteUrl.href
  }/changelog): All the cools things that happened in my life

## External links
- [LinkedIn](https://www.linkedin.com/in/rbaudibert/): My LinkedIn profile
- [GitHub](https://github.com/rafaeelaudibert): My GitHub profile
- [Instagram](https://www.instagram.com/rafaaudibeert/): My Instagram profile
- [PostHog](https://posthog.com/community/profiles/32207): My profile on PostHog's team website
`.trim()

export const GET: APIRoute = ({ site: siteUrl }) =>
  new Response(getLlmsTxt(siteUrl!), {
    headers: { "Content-Type": "text/plain" },
  })
