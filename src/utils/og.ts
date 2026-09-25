/**
 * Open Graph image rendering: a satori JSX tree -> SVG -> PNG (1200x600, 2:1).
 *
 * Fonts are the same families the site uses (see astro.config.mjs), read
 * from the @fontsource packages because satori needs raw font bytes (WOFF or
 * TTF; WOFF2 is not supported). The background is the same image the page
 * header uses, so a shared link looks like the site it points to.
 */
import fs from "node:fs/promises"
import { createRequire } from "node:module"
import type { JSX } from "react"
import satori, { type SatoriOptions } from "satori"
import sharp from "sharp"

export const OG_WIDTH = 1200
export const OG_HEIGHT = 600 // 2:1

/** Dark-theme tokens from global.css, resolved to literals for satori. */
export const og = {
  background: "#090b11", // --gray-999
  text: "#ffffff", // --gray-0
  muted: "#a3acc8", // --gray-300
  faint: "#6474a2", // --gray-500
  accent: "#c561f6", // --accent-dark (the light purple in dark mode)
  font: {
    brand: "Rubik",
    reading: "Literata",
    mono: "IBM Plex Mono",
  },
} as const

export interface OGAssets {
  /** The site's header gradient, as a data URI */
  background: string
  /** Square, face-focused crop of the portrait, as a data URI */
  portrait: string
}

const require = createRequire(import.meta.url)

const fontFile = (pkg: string, file: string) =>
  fs.readFile(require.resolve(`@fontsource/${pkg}/files/${file}`))

let fontsPromise: Promise<SatoriOptions["fonts"]> | undefined
function loadFonts() {
  fontsPromise ??= Promise.all([
    fontFile("rubik", "rubik-latin-600-normal.woff").then((data) => ({ name: og.font.brand, data, weight: 600 as const, style: "normal" as const })),
    fontFile("literata", "literata-latin-400-normal.woff").then((data) => ({ name: og.font.reading, data, weight: 400 as const, style: "normal" as const })),
    fontFile("literata", "literata-latin-400-italic.woff").then((data) => ({ name: og.font.reading, data, weight: 400 as const, style: "italic" as const })),
    fontFile("ibm-plex-mono", "ibm-plex-mono-latin-400-normal.woff").then((data) => ({ name: og.font.mono, data, weight: 400 as const, style: "normal" as const })),
    fontFile("ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff").then((data) => ({ name: og.font.mono, data, weight: 500 as const, style: "normal" as const })),
  ])
  return fontsPromise
}

const dataURI = (buffer: Buffer, type: string) => `data:${type};base64,${buffer.toString("base64")}`

let assetsPromise: Promise<OGAssets> | undefined
export function loadOGAssets(): Promise<OGAssets> {
  assetsPromise ??= (async () => {
    const [background, portrait] = await Promise.all([
      // Rendered at the final size so the embedded image stays small
      sharp("public/assets/backgrounds/bg-main-dark-1440w.jpg")
        .resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "top" })
        .jpeg({ quality: 80 })
        .toBuffer(),
      // The photo is stored sideways with an EXIF orientation tag, which
      // sharp only honours when asked. "attention" cropping keys on skin
      // tones, which finds the face.
      sharp("src/assets/portrait.jpg")
        .rotate()
        .resize(320, 320, { fit: "cover", position: sharp.strategy.attention })
        .jpeg({ quality: 85 })
        .toBuffer(),
    ])
    return { background: dataURI(background, "image/jpeg"), portrait: dataURI(portrait, "image/jpeg") }
  })()
  return assetsPromise
}

export async function renderOG(element: JSX.Element): Promise<Buffer> {
  const svg = await satori(element as any, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts: await loadFonts(),
  })
  return sharp(Buffer.from(svg)).png().toBuffer()
}
