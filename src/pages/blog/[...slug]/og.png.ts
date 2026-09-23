import { getCollection } from "astro:content"
import type { InferGetStaticParamsType } from "astro"

import BlogPost from "../../../components/og/BlogPost"
import { loadOGAssets, renderOG } from "../../../utils/og"

const posts = await getCollection("blog")
type Params = InferGetStaticParamsType<typeof getStaticPaths>

export async function getStaticPaths() {
  return posts.map((post) => ({ params: { slug: post.id }, props: post }))
}

export async function GET({ params }: { params: Params }) {
  const post = posts.find((post) => post.id === params.slug)
  if (!post) {
    return new Response("Post not found", { status: 404 })
  }

  const png = await renderOG(BlogPost({ post, assets: await loadOGAssets() }))
  return new Response(png, { headers: { "Content-Type": "image/png" } })
}
