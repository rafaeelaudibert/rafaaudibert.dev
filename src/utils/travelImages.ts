import { readdir } from "node:fs/promises"
import { basename, extname, join } from "node:path"

export const TRAVEL_DIR = join(process.cwd(), "src/assets/travel")

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"])

export async function getTravelImageFiles(
  dir: string = TRAVEL_DIR,
): Promise<string[]> {
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
      files.push(...(await getTravelImageFiles(full)))
    } else if (IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      files.push(full)
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

export function relativeTravelPath(file: string): string {
  return file.replace(TRAVEL_DIR + "/", "")
}

export function countryCodeFromTravelPath(file: string): string | null {
  return file.match(/\/travel\/([A-Z]{2})\//)?.[1] ?? null
}

export function dateFromTravelFilename(filename: string): string | null {
  const match = basename(filename).match(
    /^(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/,
  )
  if (!match) return null

  const [, year, month, day, hour, minute, second] = match
  return `${year}:${month}:${day} ${hour}:${minute}:${second}`
}

export function formatTravelDate(date: string | null): string {
  if (!date) return "unknown"
  return date.replace(/^(\d{4}):(\d{2}):(\d{2})/, "$1-$2-$3")
}
