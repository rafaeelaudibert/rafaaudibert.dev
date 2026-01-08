import fs from "fs/promises"
import satori from "satori"
import sharp from "sharp"
import type { JSX } from "react"

import OGDefault from "../components/OGDefault"

export async function GET() {
  const element = OGDefault()
  const png = await PNG(element)
  return new Response(png, { headers: { "Content-Type": "image/png" } })
}

async function SVG(component: JSX.Element) {
  return await satori(component as any, {
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
