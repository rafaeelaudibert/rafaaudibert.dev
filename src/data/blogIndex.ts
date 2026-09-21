/**
 * Shape of the blog index the Astro build writes to BLOG_INDEX_PATH.
 *
 * Blog posts live in the Astro content collection, which only exists inside
 * the Astro build. The Worker cannot import `astro:content`, so the build
 * emits this JSON and the Worker reads it back through the assets binding.
 * Both sides share this type so they cannot drift apart silently.
 */
export const BLOG_INDEX_PATH = "/api/blog.json"

export type BlogIndexEntry = {
  /** Collection id, also the URL segment under /blog/ */
  slug: string
  title: string
  description: string
  /** ISO 8601 */
  publishDate: string
  tags: string[]
  url: string
  /** Post source in Markdown/MDX, with the MDX import lines removed */
  body: string
}
