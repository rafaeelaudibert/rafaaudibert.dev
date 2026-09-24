/**
 * Draws the blog cover images as SVG and rasterises them to PNG.
 *
 * Every cover shares one canvas: the site's dark navy with the purple and blue
 * glow from the page header, a faint dot grid, and a monoline diagram for the
 * post's subject in the site's palette. No text; the cards and the OG images
 * carry the title.
 *
 * Usage: bun scripts/generate-blog-covers.ts
 * Output: src/assets/blog/<slug>.png (1600x900)
 */
import sharp from "sharp"
import { mkdir, writeFile } from "node:fs/promises"
import { join } from "node:path"

const W = 1600
const H = 900
const OUT_DIR = join(process.cwd(), "src/assets/blog")

// Site palette, dark theme
const NAVY = "#090b11"
const PURPLE = "#7611a6"
const PURPLE_LIGHT = "#c561f6"
const BLUE = "#4c11c6"
const GREY = "#a3acc8"
const GREY_DIM = "#505d84"
const WHITE = "#ffffff"

const STROKE = 6
const RADIUS = 8

const line = (x1: number, y1: number, x2: number, y2: number, extra = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${extra}/>`
const rect = (x: number, y: number, w: number, h: number, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${RADIUS}" ${extra}/>`

/** The shared backdrop: navy, two glows, a faint dot grid. */
function backdrop() {
  return `
    <defs>
      <radialGradient id="glowPurple" cx="0.22" cy="0.1" r="0.7">
        <stop offset="0" stop-color="${PURPLE}" stop-opacity="0.55"/>
        <stop offset="1" stop-color="${PURPLE}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowBlue" cx="0.85" cy="0.05" r="0.6">
        <stop offset="0" stop-color="${BLUE}" stop-opacity="0.5"/>
        <stop offset="1" stop-color="${BLUE}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowWarm" cx="0.6" cy="1.1" r="0.6">
        <stop offset="0" stop-color="#ca7879" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#ca7879" stop-opacity="0"/>
      </radialGradient>
      <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="20" cy="20" r="1.6" fill="${GREY}" fill-opacity="0.22"/>
      </pattern>
    </defs>
    <rect width="${W}" height="${H}" fill="${NAVY}"/>
    <rect width="${W}" height="${H}" fill="url(#glowPurple)"/>
    <rect width="${W}" height="${H}" fill="url(#glowBlue)"/>
    <rect width="${W}" height="${H}" fill="url(#glowWarm)"/>
    <rect width="${W}" height="${H}" fill="url(#dots)"/>
  `
}

const wrap = (body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${backdrop()}
   <g fill="none" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`

/** Bars in a shuffled order, two of them mid-swap. Basic sorting. */
function basicSorting() {
  const heights = [0.35, 0.8, 0.5, 0.95, 0.25, 0.65, 0.45, 0.9, 0.3, 0.7, 0.55, 0.85]
  const barW = 72
  const gap = 28
  const totalW = heights.length * barW + (heights.length - 1) * gap
  const x0 = (W - totalW) / 2
  const baseY = 700
  const maxH = 460
  const swap = new Set([3, 4])
  let s = line(x0 - 40, baseY, x0 + totalW + 40, baseY, `stroke="${GREY_DIM}"`)
  heights.forEach((h, i) => {
    const x = x0 + i * (barW + gap)
    const bh = h * maxH
    const hot = swap.has(i)
    s += rect(x, baseY - bh, barW, bh, hot ? `fill="${PURPLE_LIGHT}" fill-opacity="0.25" stroke="${PURPLE_LIGHT}"` : `fill="${PURPLE}" fill-opacity="0.15" stroke="${GREY}"`)
  })
  // the swap arrow above the two hot bars
  const ax1 = x0 + 3 * (barW + gap) + barW / 2
  const ax2 = x0 + 4 * (barW + gap) + barW / 2
  const ay = baseY - 0.95 * maxH - 70
  s += `<path d="M${ax1} ${ay + 30} C ${ax1} ${ay - 40}, ${ax2} ${ay - 40}, ${ax2} ${ay + 30}" stroke="${PURPLE_LIGHT}"/>`
  s += `<path d="M${ax2 - 18} ${ay + 8} L${ax2} ${ay + 34} L${ax2 + 18} ${ay + 8}" stroke="${PURPLE_LIGHT}"/>`
  s += `<path d="M${ax1 - 18} ${ay + 8} L${ax1} ${ay + 34} L${ax1 + 18} ${ay + 8}" stroke="${PURPLE_LIGHT}"/>`
  // the n-squared curve behind
  s += `<path d="M${x0 - 40} ${baseY - 20} Q ${x0 + totalW * 0.75} ${baseY - 60}, ${x0 + totalW + 40} ${baseY - maxH - 60}" stroke="${GREY_DIM}" stroke-dasharray="10 16"/>`
  return wrap(s)
}

/** A merge-sort tree: one row splitting into halves, then quarters. Intermediate sorting. */
function intermediateSorting() {
  const values = [7, 2, 9, 4, 1, 8, 3, 6]
  const cell = 104
  const gap = 16
  const rowW = values.length * cell + (values.length - 1) * gap
  const x0 = (W - rowW) / 2
  const rows = [
    { y: 110, groups: [values] },
    { y: 398, groups: [values.slice(0, 4), values.slice(4)] },
    { y: 686, groups: [values.slice(0, 2), values.slice(2, 4), values.slice(4, 6), values.slice(6)] },
  ]
  let s = ""
  const centers: number[][] = []
  rows.forEach((row, ri) => {
    const groupCount = row.groups.length
    const groupW = (rowW - (groupCount - 1) * 60) / groupCount
    const cs: number[] = []
    row.groups.forEach((g, gi) => {
      const gx = x0 + gi * (groupW + 72)
      const innerCell = (groupW - (g.length - 1) * gap) / g.length
      g.forEach((v, vi) => {
        const cx = gx + vi * (innerCell + gap)
        const sorted = ri === 2
        const hot = sorted && v > g[(vi + 1) % g.length] && vi === 0
        s += rect(cx, row.y, innerCell, cell, `fill="${sorted ? PURPLE_LIGHT : PURPLE}" fill-opacity="${sorted ? 0.25 : 0.15}" stroke="${sorted ? PURPLE_LIGHT : GREY}"`)
        // value as a bar height inside the cell
        const bh = (v / 9) * (cell - 32)
        s += `<rect x="${cx + innerCell / 2 - 12}" y="${row.y + cell - 16 - bh}" width="24" height="${bh}" rx="4" fill="${hot ? WHITE : sorted ? PURPLE_LIGHT : GREY}" stroke="none"/>`
      })
      cs.push(gx + groupW / 2)
    })
    centers.push(cs)
  })
  // connectors: each group to its two children
  for (let ri = 0; ri < rows.length - 1; ri++) {
    centers[ri].forEach((cx, gi) => {
      const y1 = rows[ri].y + cell
      const y2 = rows[ri + 1].y
      ;[centers[ri + 1][gi * 2], centers[ri + 1][gi * 2 + 1]].forEach((tx) => {
        s += `<path d="M${cx} ${y1 + 14} C ${cx} ${y1 + 110}, ${tx} ${y2 - 110}, ${tx} ${y2 - 14}" stroke="${GREY_DIM}"/>`
      })
    })
  }
  return wrap(s)
}

/** Keys on the left, a hash in the middle, buckets on the right. Two keys collide. */
function hashTable() {
  const buckets = 8
  const bh = 66
  const bgap = 14
  const bx = 1060
  const by0 = (H - (buckets * bh + (buckets - 1) * bgap)) / 2
  let s = ""
  for (let i = 0; i < buckets; i++) {
    const y = by0 + i * (bh + bgap)
    const filled = [1, 3, 6].includes(i)
    s += rect(bx, y, 320, bh, filled ? `fill="${PURPLE}" fill-opacity="0.25" stroke="${PURPLE_LIGHT}"` : `stroke="${GREY_DIM}"`)
    if (filled) s += `<rect x="${bx + 20}" y="${y + 20}" width="${i === 3 ? 120 : 70}" height="26" rx="4" fill="${PURPLE_LIGHT}" fill-opacity="0.8" stroke="none"/>`
    if (i === 3) s += `<rect x="${bx + 160}" y="${y + 20}" width="70" height="26" rx="4" fill="${WHITE}" fill-opacity="0.85" stroke="none"/>`
  }
  // the hash box
  const hx = 660
  const hy = H / 2 - 90
  s += rect(hx, hy, 180, 180, `fill="${PURPLE}" fill-opacity="0.2" stroke="${PURPLE_LIGHT}" stroke-width="8"`)
  s += `<path d="M${hx + 58} ${hy + 40} L${hx + 44} ${hy + 140} M${hx + 128} ${hy + 40} L${hx + 114} ${hy + 140} M${hx + 36} ${hy + 76} L${hx + 146} ${hy + 76} M${hx + 30} ${hy + 108} L${hx + 140} ${hy + 108}" stroke="${WHITE}" stroke-width="10"/>`
  // keys
  const keys = [220, 380, 540, 700]
  const kx = 220
  keys.forEach((ky, i) => {
    s += rect(kx, ky - 30, 230, 60, `stroke="${GREY}" fill="${NAVY}" fill-opacity="0.6"`)
    s += `<rect x="${kx + 20}" y="${ky - 8}" width="${[110, 150, 90, 130][i]}" height="16" rx="3" fill="${GREY}" stroke="none"/>`
    s += `<path d="M${kx + 230} ${ky} C ${kx + 330} ${ky}, ${hx - 100} ${H / 2}, ${hx} ${H / 2}" stroke="${GREY_DIM}"/>`
  })
  // hash to buckets (1, 3, 3, 6): the two arrows into bucket 3 are the collision
  const targets = [1, 3, 3, 6]
  targets.forEach((t, i) => {
    const ty = by0 + t * (bh + bgap) + bh / 2 + (t === 3 ? (i === 1 ? -12 : 12) : 0)
    s += `<path d="M${hx + 180} ${H / 2} C ${hx + 300} ${H / 2}, ${bx - 140} ${ty}, ${bx} ${ty}" stroke="${t === 3 ? PURPLE_LIGHT : GREY}"/>`
  })
  return wrap(s)
}

/** A pipeline of stages, values thinning through map, filter and reduce, ending in a star. */
function dartAdventOfCode() {
  const y = H / 2
  const stages = [
    { x: 160, count: 6, w: 200 },
    { x: 500, count: 6, w: 200 },
    { x: 840, count: 3, w: 200 },
    { x: 1180, count: 1, w: 200 },
  ]
  let s = ""
  stages.forEach((st, si) => {
    const isLast = si === stages.length - 1
    s += rect(st.x, y - 150, st.w, 300, `stroke="${isLast ? PURPLE_LIGHT : GREY_DIM}" fill="${isLast ? PURPLE : NAVY}" fill-opacity="${isLast ? 0.2 : 0.5}"`)
    if (!isLast) {
      const cell = 36
      const gap = 12
      const totalH = st.count * cell + (st.count - 1) * gap
      for (let i = 0; i < st.count; i++) {
        const cy = y - totalH / 2 + i * (cell + gap)
        const on = si === 0 || si === 1 || (si === 2 && true)
        s += `<rect x="${st.x + st.w / 2 - cell / 2}" y="${cy}" width="${cell}" height="${cell}" rx="4" fill="${si === 1 ? PURPLE_LIGHT : GREY}" fill-opacity="${on ? 0.85 : 0.2}" stroke="none"/>`
      }
    } else {
      const cx = st.x + st.w / 2
      const pts: string[] = []
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 70 : 30
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`)
      }
      s += `<polygon points="${pts.join(" ")}" fill="${PURPLE_LIGHT}" fill-opacity="0.9" stroke="${WHITE}"/>`
    }
    if (si < stages.length - 1) {
      const ax = st.x + st.w
      const nx = stages[si + 1].x
      s += line(ax + 16, y, nx - 40, y, `stroke="${PURPLE_LIGHT}"`)
      s += `<path d="M${nx - 64} ${y - 20} L${nx - 36} ${y} L${nx - 64} ${y + 20}" stroke="${PURPLE_LIGHT}"/>`
    }
  })
  return wrap(s)
}

/** A funnel of applications: wide bars narrowing to one. */
function jobSearch() {
  const widths = [1100, 780, 520, 300, 150, 72]
  const bh = 78
  const gap = 34
  const totalH = widths.length * bh + (widths.length - 1) * gap
  const y0 = (H - totalH) / 2
  let s = ""
  widths.forEach((w, i) => {
    const x = (W - w) / 2
    const y = y0 + i * (bh + gap)
    const last = i === widths.length - 1
    s += rect(x, y, w, bh, last ? `fill="${PURPLE_LIGHT}" fill-opacity="0.35" stroke="${PURPLE_LIGHT}"` : `fill="${PURPLE}" fill-opacity="${0.1 + i * 0.05}" stroke="${GREY}"`)
    if (i < widths.length - 1) {
      const nw = widths[i + 1]
      s += `<path d="M${x} ${y + bh + 6} L${(W - nw) / 2} ${y + bh + gap - 6} M${x + w} ${y + bh + 6} L${(W + nw) / 2} ${y + bh + gap - 6}" stroke="${GREY_DIM}" stroke-dasharray="6 12"/>`
    }
  })
  // tick marks at the sides, like an axis
  for (let i = 0; i < widths.length; i++) {
    const y = y0 + i * (bh + gap) + bh / 2
    s += line(120, y, 150, y, `stroke="${GREY_DIM}"`)
    s += line(W - 150, y, W - 120, y, `stroke="${GREY_DIM}"`)
  }
  return wrap(s)
}

/** Boxes leaving a faded cluster on the left for a lit one on the right. */
function awsToCloudflare() {
  let s = ""
  const box = 110
  const gap = 26
  const cluster = (x0: number, y0: number, lit: boolean, missing: number[] = []) => {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const idx = r * 3 + c
        if (missing.includes(idx)) continue
        const x = x0 + c * (box + gap)
        const y = y0 + r * (box + gap)
        s += rect(x, y, box, box, lit ? `fill="${PURPLE}" fill-opacity="0.3" stroke="${PURPLE_LIGHT}"` : `stroke="${GREY_DIM}" stroke-dasharray="${idx % 2 ? "8 10" : "none"}"`)
        if (lit) s += `<rect x="${x + 24}" y="${y + 24}" width="${box - 48}" height="14" rx="3" fill="${PURPLE_LIGHT}" fill-opacity="0.8" stroke="none"/>`
      }
    }
  }
  const leftX = 200
  const rightX = W - 200 - 3 * box - 2 * gap
  const y0 = (H - (3 * box + 2 * gap)) / 2
  cluster(leftX, y0, false, [4, 8])
  cluster(rightX, y0, true)
  // one arc from cluster to cluster, with two boxes riding it
  const midY = H / 2
  const lx = leftX + 3 * box + 2 * gap
  const p0 = { x: lx + 30, y: midY }
  const p1 = { x: lx + 160, y: midY - 300 }
  const p2 = { x: rightX - 160, y: midY - 300 }
  const p3 = { x: rightX - 30, y: midY }
  const bez = (t: number) => {
    const mt = 1 - t
    return {
      x: mt ** 3 * p0.x + 3 * mt ** 2 * t * p1.x + 3 * mt * t ** 2 * p2.x + t ** 3 * p3.x,
      y: mt ** 3 * p0.y + 3 * mt ** 2 * t * p1.y + 3 * mt * t ** 2 * p2.y + t ** 3 * p3.y,
    }
  }
  s += `<path d="M${p0.x} ${p0.y} C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y}" stroke="${PURPLE_LIGHT}"/>`
  s += `<path d="M${p3.x - 44} ${p3.y - 30} L${p3.x} ${p3.y} L${p3.x - 8} ${p3.y - 52}" stroke="${PURPLE_LIGHT}"/>`
  ;[0.2, 0.8].forEach((t) => {
    const c = bez(t)
    s += rect(c.x - 44, c.y - 44, 88, 88, `fill="${PURPLE}" fill-opacity="0.3" stroke="${PURPLE_LIGHT}"`)
  })
  // a magnifying glass over the left cluster: the digging
  const gx = leftX + box + gap / 2 + box / 2
  const gy = y0 + 2 * (box + gap) + box / 2
  s += `<circle cx="${gx}" cy="${gy}" r="58" stroke="${WHITE}" fill="${NAVY}" fill-opacity="0.4"/>`
  s += line(gx + 42, gy + 42, gx + 96, gy + 96, `stroke="${WHITE}" stroke-width="12"`)
  return wrap(s)
}

const COVERS: Record<string, () => string> = {
  "asymptotic-notations-and-basic-sorting-algorithms": basicSorting,
  "intermediate-sorting-algorithms": intermediateSorting,
  "implementing-a-hash-table": hashTable,
  "a-functional-view-over-advent-of-code-with-dart": dartAdventOfCode,
  "applying-for-a-job-in-2024": jobSearch,
  "migrating-from-aws-to-cloudflare-with-claude": awsToCloudflare,
}

await mkdir(OUT_DIR, { recursive: true })
for (const [slug, draw] of Object.entries(COVERS)) {
  const png = await sharp(Buffer.from(draw())).png({ compressionLevel: 9 }).toBuffer()
  await writeFile(join(OUT_DIR, `${slug}.png`), png)
  console.log(`${slug}.png ${(png.length / 1024).toFixed(0)}KB`)
}
