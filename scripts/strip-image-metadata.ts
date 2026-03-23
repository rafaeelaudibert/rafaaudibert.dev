/**
 * Strips EXIF metadata from travel images, keeping only the date taken.
 * Renames files to their date (YYYYMMDD_HHMMSS.ext) if not already named that way.
 *
 * Usage:
 *   bun scripts/strip-image-metadata.ts            Interactive mode — shows metadata, asks what to do
 *   bun scripts/strip-image-metadata.ts --auto     Non-interactive — strips all, keeps date, renames
 *   bun scripts/strip-image-metadata.ts --check    Just report files with metadata (for CI/hooks, exit 1 if any)
 */

import sharp from "sharp"
import { readdir, writeFile, rename, stat, unlink, access } from "fs/promises"
import { join, extname, dirname, basename } from "path"
import { createInterface } from "readline"

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

const TRAVEL_DIR = join(import.meta.dir, "../src/assets/travel")
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])
const AUTO_MODE = process.argv.includes("--auto")
const CHECK_MODE = process.argv.includes("--check")
const DATE_FILENAME_RE = /^\d{8}_\d{6}\./

const rl =
  !AUTO_MODE && !CHECK_MODE
    ? createInterface({ input: process.stdin, output: process.stdout })
    : null

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl!.question(question, (answer) => resolve(answer.trim().toLowerCase()))
  })
}

async function getImageFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  let entries: Awaited<ReturnType<typeof readdir>>
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getImageFiles(full)))
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      files.push(full)
    }
  }
  return files.sort((a, b) => a.localeCompare(b))
}

interface ExifInfo {
  date: string | null
  exifSize: number
  isClean: boolean
}

// A date-only EXIF written by our strip script is ~300 bytes or less
const MAX_CLEAN_EXIF_SIZE = 300

function parseExif(exifBuffer: Buffer): ExifInfo {
  const str = exifBuffer.toString("binary")
  const dateMatch = str.match(/(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/)

  return {
    date: dateMatch ? dateMatch[1] : null,
    exifSize: exifBuffer.length,
    isClean: exifBuffer.length <= MAX_CLEAN_EXIF_SIZE,
  }
}

function dateToFilename(date: string, ext: string): string {
  // "2024:11:24 12:00:00" -> "20241124_120000.jpg"
  return date.replace(/:/g, "").replace(" ", "_") + ext.toLowerCase()
}

async function processFile(
  file: string,
  info: ExifInfo | null
): Promise<{ newPath: string; beforeSize: number; afterSize: number }> {
  const beforeSize = await stat(file).then(data => data.size)
  const metadata = await sharp(file).metadata()

  // Step 1: decode + auto-rotate into a clean pixel buffer (strips ALL metadata)
  const { data, info: rawInfo } = await sharp(file)
    .rotate()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Step 2: re-encode as webp from raw pixels (guaranteed no carried-over EXIF)
  let pipeline = sharp(data, {
    raw: {
      width: rawInfo.width,
      height: rawInfo.height,
      channels: rawInfo.channels as 1 | 2 | 3 | 4,
    },
  }).webp({ quality: 90 })

  // Step 3: add back ONLY the date
  const now = new Date()
  const date = info?.date ??
    `${now.getFullYear()}:${String(now.getMonth() + 1).padStart(2, "0")}:${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

  pipeline = pipeline.withExif({
    IFD0: { DateTime: date },
    IFD2: {
      DateTimeOriginal: date,
      DateTimeDigitized: date,
    },
  })

  const output = await pipeline.toBuffer()

  // Write as .webp, delete original if it was a different format
  const oldExt = extname(file)
  const webpFile = join(dirname(file), basename(file, oldExt) + ".webp")

  await writeFile(webpFile, output)
  if (oldExt.toLowerCase() !== ".webp") {
    await unlink(file)
  }

  // Rename to date-based filename
  let newPath = webpFile

  if (!DATE_FILENAME_RE.test(basename(webpFile))) {
    const newName = dateToFilename(date, ".webp")
    newPath = join(dirname(webpFile), newName)

    // Avoid collision
    let finalPath = newPath
    let counter = 1
    while (true) {
      try {
        await access(finalPath)
        finalPath = join(
          dirname(webpFile),
          dateToFilename(date, `_${counter}.webp`)
        )
        counter++
      } catch {
        break
      }
    }
    newPath = finalPath
    if (webpFile !== newPath) await rename(webpFile, newPath)
  }

  const afterSize = await stat(newPath).then(data => data.size)
  return { newPath, beforeSize, afterSize }
}

async function main() {
  const files = await getImageFiles(TRAVEL_DIR)

  if (files.length === 0) {
    console.log("No travel images found.")
    process.exit(0)
  }

  console.log(`Found ${files.length} image(s) in ${TRAVEL_DIR}\n`)

  let stripped = 0
  let skipped = 0
  let needsStripping = 0

  for (const file of files) {
    const rel = file.replace(TRAVEL_DIR + "/", "")
    const metadata = await sharp(file).metadata()
    const isWebp = file.toLowerCase().endsWith(".webp")
    const info = metadata.exif ? parseExif(metadata.exif) : null
    const alreadyClean = isWebp && (!info || info.isClean)

    if (CHECK_MODE) {
      if (!isWebp) {
        console.log(`  FAIL  ${rel} — not webp (run strip-metadata --auto to convert)`)
        needsStripping++
      } else if (info && !info.isClean) {
        console.log(`  FAIL  ${rel} — ${info.exifSize} bytes of EXIF (date: ${info.date ?? "none"})`)
        needsStripping++
      }
      continue
    }

    if (alreadyClean) {
      skipped++
      if (!AUTO_MODE) console.log(`  SKIP  ${rel} — already clean`)
      continue
    }

    if (AUTO_MODE) {
      try {
        const { newPath, beforeSize, afterSize } = await processFile(file, info)
        const newRel = newPath.replace(TRAVEL_DIR + "/", "")
        const saved = ((1 - afterSize / beforeSize) * 100).toFixed(0)
        console.log(
          `  DONE  ${rel}${newRel !== rel ? ` -> ${newRel}` : ""} (${fmtSize(beforeSize)} -> ${fmtSize(afterSize)}, -${saved}%)`
        )
        stripped++
      } catch (e) {
        console.error(`  ERROR ${rel}: ${e}`)
      }
      continue
    }

    // Interactive mode
    console.log(`\n--- ${rel} ---`)
    console.log(`  EXIF size: ${info?.exifSize ?? 0} bytes`)
    if (info?.date) console.log(`  Date: ${info.date}`)
    else console.log(`  Date: none (will use current date)`)
    if (info?.isClean) console.log(`  Status: clean (date-only)`)
    else console.log(`  Status: has extra metadata to strip`)

    const answer = await ask(
      `  Action? [S]trip metadata & rename (default) / s[k]ip / [q]uit: `
    )

    if (answer === "q") {
      console.log("Quitting.")
      break
    } else if (answer === "k") {
      console.log("  Skipped.")
      skipped++
    } else {
      try {
        const { newPath, beforeSize, afterSize } = await processFile(file, info)
        const newRel = newPath.replace(TRAVEL_DIR + "/", "")
        const saved = ((1 - afterSize / beforeSize) * 100).toFixed(0)
        console.log(
          `  Stripped!${newRel !== rel ? ` Renamed to ${newRel}` : ""} (${fmtSize(beforeSize)} -> ${fmtSize(afterSize)}, -${saved}%)`
        )
        stripped++
      } catch (e) {
        console.error(`  ERROR: ${e}`)
      }
    }
  }

  rl?.close()

  if (CHECK_MODE) {
    if (needsStripping > 0) {
      console.log(
        `\n${needsStripping} file(s) have metadata that should be stripped.`
      )
      console.log("Run: bun run strip-metadata --auto")
      process.exit(1)
    } else {
      console.log("\nAll images are clean.")
    }
  } else {
    console.log(
      `\nDone. ${stripped} stripped, ${skipped} skipped.`
    )
  }
}

main()
