/**
 * Draws the site icon and writes every size the web needs from it.
 *
 * The icon is the header aurora: the site's navy with the purple glow
 * top-left, the blue glow top-right and the warm glow at the bottom, on a
 * rounded tile. No letter, so it reads at 16px and matches the page it opens.
 *
 * Usage: bun run icons
 * Writes to public/:
 *   favicon.svg            scalable, rounded, what modern browsers use
 *   favicon.ico            16 + 32 + 48 PNG-in-ICO, for the rest
 *   favicon.png            32px, kept for anything that still points at it
 *   apple-touch-icon.png   180px, square: iOS rounds it itself
 *   icon-192.png, icon-512.png  square, for the web manifest (maskable)
 *   logo.png               1024px rounded, for anywhere a logo is needed
 */
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"
import sharp from "sharp"

const OUT = join(process.cwd(), "public")

const NAVY = "#090b11"
const PURPLE = "#7611a6"
const PURPLE_LIGHT = "#c561f6"
const BLUE = "#4c11c6"
const WARM = "#ca7879"

/** The tile at any size. `rounded` clips the corners (22% radius, like the site's cards scaled up). */
function iconSvg(size: number, rounded: boolean) {
  const r = rounded ? Math.round(size * 0.22) : 0
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <defs>
    <clipPath id="tile"><rect width="512" height="512" rx="${(r * 512) / size}"/></clipPath>
    <radialGradient id="purple" cx="0.2" cy="0.1" r="0.85">
      <stop offset="0" stop-color="${PURPLE_LIGHT}"/>
      <stop offset="0.45" stop-color="${PURPLE}"/>
      <stop offset="1" stop-color="${PURPLE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="blue" cx="0.9" cy="0.15" r="0.7">
      <stop offset="0" stop-color="${BLUE}"/>
      <stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warm" cx="0.6" cy="1.05" r="0.6">
      <stop offset="0" stop-color="${WARM}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${WARM}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <g clip-path="url(#tile)">
    <rect width="512" height="512" fill="${NAVY}"/>
    <rect width="512" height="512" fill="url(#purple)"/>
    <rect width="512" height="512" fill="url(#blue)"/>
    <rect width="512" height="512" fill="url(#warm)"/>
  </g>
</svg>
`
}

const png = (size: number, rounded: boolean) =>
  sharp(Buffer.from(iconSvg(size, rounded)), { density: 384 }).resize(size, size).png().toBuffer()

/** ICO container around PNG images, which every current browser accepts. */
function ico(images: { size: number; data: Buffer }[]) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  const entries: Buffer[] = []
  let offset = 6 + 16 * images.length
  for (const { size, data } of images) {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2) // palette
    e.writeUInt8(0, 3) // reserved
    e.writeUInt16LE(1, 4) // planes
    e.writeUInt16LE(32, 6) // bits per pixel
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    entries.push(e)
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)])
}

await mkdir(OUT, { recursive: true })
await writeFile(join(OUT, "favicon.svg"), iconSvg(512, true))
await writeFile(join(OUT, "favicon.png"), await png(32, true))
await writeFile(join(OUT, "favicon.ico"), ico(await Promise.all([16, 32, 48].map(async (s) => ({ size: s, data: await png(s, true) })))))
await writeFile(join(OUT, "apple-touch-icon.png"), await png(180, false))
await writeFile(join(OUT, "icon-192.png"), await png(192, false))
await writeFile(join(OUT, "icon-512.png"), await png(512, false))
await writeFile(join(OUT, "logo.png"), await png(1024, true))
console.log("icons written to public/")
