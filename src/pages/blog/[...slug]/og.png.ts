import fs from "fs/promises"
import satori from "satori"
import sharp from "sharp"
import { getCollection } from "astro:content"
import type { InferGetStaticParamsType } from "astro"

import OpenGraphImage from "../../../components/OG"
import type { JSX } from "react"

const posts = await getCollection("blog")
type Params = InferGetStaticParamsType<typeof getStaticPaths>

export async function getStaticPaths() {
    return posts.map((post) => ({ params: { slug: post.id }, props: post }))
}

export async function GET({ params }: { params: Params }) {
    const post = posts.find((post) => post.id === params.slug) // Find the specific post by ID
    if (!post) {
        return new Response("Post not found", { status: 404 })
    }

    const element = OpenGraphImage(post)
    const png = await PNG(element)
    return new Response(png, { headers: { "Content-Type": "image/png" } })
}

async function SVG(component: JSX.Element) {
    return await satori(component as any, {
        // 1200 x 630 is the recommended size for OpenGraph images
        width: 1200,
        height: 630,
        fonts: [
            {
                name: "Outfit",
                data: await fs.readFile("./src/assets/blog/fonts/Outfit-Regular.ttf"),
                weight: 400,
            },
        ],
    })
}

async function PNG(component: JSX.Element) {
    return sharp(Buffer.from(await SVG(component))).png().toBuffer()
}