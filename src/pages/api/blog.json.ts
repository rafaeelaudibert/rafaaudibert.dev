import type { APIRoute } from "astro"
import { getCollection } from "astro:content"
import type { BlogIndexEntry } from "../../data/blogIndex"

// MDX posts import React components at the top of the file. Those lines mean
// nothing outside the build, so they are dropped before the body is exposed.
const stripMdxImports = (body: string) =>
  body.replace(/^import\s[^\n]*\n?/gm, "").trim()

export const GET: APIRoute = async ({ site }) => {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf()
  )

  const entries: BlogIndexEntry[] = posts.map((post) => ({
    slug: post.id,
    title: post.data.title,
    description: post.data.description.trim(),
    publishDate: post.data.publishDate.toISOString(),
    tags: post.data.tags,
    url: new URL(`/blog/${post.id}/`, site).href,
    body: stripMdxImports(post.body ?? ""),
  }))

  return new Response(JSON.stringify(entries), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  })
}
