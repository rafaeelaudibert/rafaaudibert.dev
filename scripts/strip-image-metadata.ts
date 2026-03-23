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
import { readdir, writeFile, rename } from "fs/promises"
import { join, extname, dirname, basename } from "path"
import { createInterface } from "readline"

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
  return files
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
  info: ExifInfo
): Promise<{ newPath: string }> {
  const metadata = await sharp(file).metadata()
  const format = metadata.format as string

  // Step 1: decode + auto-rotate into a clean pixel buffer (strips ALL metadata)
  const { data, info: rawInfo } = await sharp(file)
    .rotate()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // Step 2: re-encode from raw pixels (guaranteed no carried-over EXIF)
  let pipeline = sharp(data, {
    raw: {
      width: rawInfo.width,
      height: rawInfo.height,
      channels: rawInfo.channels as 1 | 2 | 3 | 4,
    },
  })

  if (format === "jpeg" || format === "jpg") {
    pipeline = pipeline.jpeg({ quality: 95, mozjpeg: true })
  } else if (format === "png") {
    pipeline = pipeline.png()
  } else if (format === "webp") {
    pipeline = pipeline.webp({ quality: 95 })
  }

  // Step 3: add back ONLY the date
  if (info.date) {
    pipeline = pipeline.withExif({
      IFD0: { DateTime: info.date },
      IFD2: {
        DateTimeOriginal: info.date,
        DateTimeDigitized: info.date,
      },
    })
  }

  const output = await pipeline.toBuffer()
  await writeFile(file, output)

  // Rename to date-based filename if we have a date and it's not already named that way
  const ext = extname(file)
  const name = basename(file)
  let newPath = file

  if (info.date && !DATE_FILENAME_RE.test(name)) {
    const newName = dateToFilename(info.date, ext)
    newPath = join(dirname(file), newName)

    // Avoid collision
    let finalPath = newPath
    let counter = 1
    const { access } = await import("fs/promises")
    while (true) {
      try {
        await access(finalPath)
        // File exists, add suffix
        finalPath = join(
          dirname(file),
          dateToFilename(info.date, `_${counter}${ext}`)
        )
        counter++
      } catch {
        break // File doesn't exist, safe to use
      }
    }
    newPath = finalPath
    await rename(file, newPath)
  }

  return { newPath }
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

    if (!metadata.exif || metadata.exif.length === 0) {
      if (CHECK_MODE) continue
      if (!AUTO_MODE) console.log(`  CLEAN ${rel} — no EXIF metadata`)
      skipped++
      continue
    }

    const info = parseExif(metadata.exif)

    if (CHECK_MODE) {
      if (info.isClean) continue
      console.log(`  FAIL  ${rel} — ${info.exifSize} bytes of EXIF (date: ${info.date ?? "none"})`)
      needsStripping++
      continue
    }

    if (AUTO_MODE) {
      // Auto: strip everything, keep date, rename
      try {
        const { newPath } = await processFile(file, info)
        const newRel = newPath.replace(TRAVEL_DIR + "/", "")
        console.log(
          `  DONE  ${rel}${newRel !== rel ? ` -> ${newRel}` : ""}`
        )
        stripped++
      } catch (e) {
        console.error(`  ERROR ${rel}: ${e}`)
      }
      continue
    }

    // Interactive mode
    console.log(`\n--- ${rel} ---`)
    console.log(`  EXIF size: ${info.exifSize} bytes`)
    if (info.date) console.log(`  Date: ${info.date}`)
    if (info.isClean) console.log(`  Status: clean (date-only)`)
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
        const { newPath } = await processFile(file, info)
        const newRel = newPath.replace(TRAVEL_DIR + "/", "")
        console.log(
          `  Stripped!${newRel !== rel ? ` Renamed to ${newRel}` : ""}`
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
