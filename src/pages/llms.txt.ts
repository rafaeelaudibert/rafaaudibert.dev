import type { APIRoute } from 'astro'
import { BACKGROUND_CONTENT, EDUCATION_AND_ACHIEVEMENTS, PAST_EXPERIENCES, TECHNOLOGIES, LANGUAGES } from "./resume.astro"
import { getCollection } from 'astro:content';

const blogposts = (await getCollection("blog")).sort(
  (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
)

const getLlmsTxt = (site: URL) => `
# rafaaudibert.dev

## About me

### Background
${BACKGROUND_CONTENT.join("\n")}

### Past Experiences
${PAST_EXPERIENCES.map((experience) => `- ${experience.company} (${experience.startDate} - ${experience.endDate}): ${experience.role}`).join("\n")}

### Education and Achievements
${EDUCATION_AND_ACHIEVEMENTS.map((education) => `${education.year}: ${education.description}`).join("\n")}

### Technologies I worked with
${TECHNOLOGIES.map((technology) => `${technology.type}: ${technology.technologies.join(", ")}`).join("\n")}

### Languages I speak
${LANGUAGES.map((language) => `${language.language}: (${language.level})`).join("\n")}

## Website content
- [Blog](${site.href}/blog): My blog posts
${blogposts.map((post) => `  - [${post.data.title}](${site.href}/blog/${post.id}): ${post.data.title}`).join("\n")}	
- [Resume](${site.href}/resume): A little bit about me, my background, my past experiences, and my skills
- [Changelog](${site.href}/changelog): All the cools things that happened in my life

## External links
- [LinkedIn](https://www.linkedin.com/in/rbaudibert/): My LinkedIn profile
- [GitHub](https://github.com/rafaeelaudibert): My GitHub profile
- [Instagram](https://www.instagram.com/rafaaudibeert/): My Instagram profile
- [PostHog](https://posthog.com/community/profiles/32207): My profile on PostHog's team website
`.trim();

export const GET: APIRoute = ({ site }) => new Response(getLlmsTxt(site!), {
  headers: { 'Content-Type': 'text/plain', },
})
