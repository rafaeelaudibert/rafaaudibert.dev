import exifReader from "exif-reader"
import sharp from "sharp"
import { writeFile } from "node:fs/promises"
import { dateFromTravelFilename } from "./travelImages"

export interface TravelImageExif {
  date: string | null
  description: string | null
  exifSize: number
}

export const TRAVEL_IMAGE_DESCRIPTION_FORMAT =
  "<Subject>, <context>"

const MIN_DESCRIPTION_LENGTH = 12
const MAX_DESCRIPTION_LENGTH = 160
const DESCRIPTION_SEPARATOR = ", "

export const TRAVEL_IMAGE_DESCRIPTION_HELP = `Description format: ${TRAVEL_IMAGE_DESCRIPTION_FORMAT}

Rules:
  • One line, ${MIN_DESCRIPTION_LENGTH}–${MAX_DESCRIPTION_LENGTH} characters
  • "<Subject>" = what is in the photo (≥3 characters, start with a capital letter)
  • ", " = comma + space separator (exactly once)
  • "<context>" = where / when / why (≥3 characters)
  • No line breaks

Examples:
  • Team hackathon demo, PostHog offsite in Barbados
  • Sunset over the marina, honeymoon in Pipa Brazil
  • First talk on stage, Lovable conference in Porto Alegre`

function normalizeDescription(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : null
  }

  if (Buffer.isBuffer(value)) {
    const trimmed = value.toString("utf8").replace(/\0/g, "").trim()
    return trimmed.length > 0 ? trimmed : null
  }

  return null
}

export function parseTravelImageExif(exifBuffer: Buffer): TravelImageExif {
  try {
    const parsed = exifReader(exifBuffer)
    const description =
      normalizeDescription(parsed.Image?.ImageDescription) ??
      normalizeDescription(parsed.Photo?.UserComment)

    const dateTime =
      parsed.Image?.DateTime ??
      parsed.Photo?.DateTimeOriginal ??
      parsed.Photo?.DateTimeDigitized

    let date: string | null = null
    if (dateTime instanceof Date && !Number.isNaN(dateTime.getTime())) {
      const pad = (n: number) => String(n).padStart(2, "0")
      date = `${dateTime.getFullYear()}:${pad(dateTime.getMonth() + 1)}:${pad(dateTime.getDate())} ${pad(dateTime.getHours())}:${pad(dateTime.getMinutes())}:${pad(dateTime.getSeconds())}`
    }

    return {
      date,
      description,
      exifSize: exifBuffer.length,
    }
  } catch {
    const str = exifBuffer.toString("binary")
    const dateMatch = str.match(/(\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2})/)

    return {
      date: dateMatch?.[1] ?? null,
      description: null,
      exifSize: exifBuffer.length,
    }
  }
}

export async function readTravelImageExif(
  filePath: string,
): Promise<TravelImageExif | null> {
  const metadata = await sharp(filePath).metadata()
  if (!metadata.exif) return null
  return parseTravelImageExif(metadata.exif)
}

export function buildTravelImageAlt(
  description: string | null,
  fallback: string,
): string {
  return description ?? fallback
}

export function validateTravelImageDescription(
  input: string,
):
  | { ok: true; value: string }
  | { ok: false; error: string } {
  const value = input.trim().replace(/\s+/g, " ")

  if (!value) {
    return { ok: false, error: "Description cannot be empty." }
  }

  if (value.includes("\n")) {
    return { ok: false, error: "Description must be a single line." }
  }

  if (value.length < MIN_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `Description is too short (minimum ${MIN_DESCRIPTION_LENGTH} characters).`,
    }
  }

  if (value.length > MAX_DESCRIPTION_LENGTH) {
    return {
      ok: false,
      error: `Description is too long (maximum ${MAX_DESCRIPTION_LENGTH} characters).`,
    }
  }

  const separatorIndex = value.indexOf(DESCRIPTION_SEPARATOR)
  if (separatorIndex === -1) {
    return {
      ok: false,
      error: `Use "${DESCRIPTION_SEPARATOR}" between subject and context.`,
    }
  }

  if (value.indexOf(DESCRIPTION_SEPARATOR, separatorIndex + 1) !== -1) {
    return {
      ok: false,
      error: `Use "${DESCRIPTION_SEPARATOR}" only once.`,
    }
  }

  const subject = value.slice(0, separatorIndex)
  const context = value.slice(separatorIndex + DESCRIPTION_SEPARATOR.length)

  if (subject.length < 3) {
    return { ok: false, error: "Subject must be at least 3 characters." }
  }

  if (context.length < 3) {
    return { ok: false, error: "Context must be at least 3 characters." }
  }

  if (!/^[A-Z]/.test(subject)) {
    return {
      ok: false,
      error: "Subject must start with a capital letter.",
    }
  }

  return { ok: true, value }
}

export function isValidTravelImageDescription(
  description: string | null | undefined,
): description is string {
  if (!description) return false
  return validateTravelImageDescription(description).ok
}

export function resolveTravelImageDate(
  filePath: string,
  exif: TravelImageExif | null,
): string {
  if (exif?.date) return exif.date

  const fromFilename = dateFromTravelFilename(filePath)
  if (fromFilename) return fromFilename

  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}:${pad(now.getMonth() + 1)}:${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

export async function writeTravelImageExif(
  filePath: string,
  options: { date: string; description: string },
): Promise<void> {
  const validated = validateTravelImageDescription(options.description)
  if (!validated.ok) {
    throw new Error(validated.error)
  }

  const { data, info: rawInfo } = await sharp(filePath)
    .rotate()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const output = await sharp(data, {
    raw: {
      width: rawInfo.width,
      height: rawInfo.height,
      channels: rawInfo.channels as 1 | 2 | 3 | 4,
    },
  })
    .webp({ quality: 90 })
    .withExif({
      IFD0: {
        DateTime: options.date,
        ImageDescription: validated.value,
      },
      IFD2: {
        DateTimeOriginal: options.date,
        DateTimeDigitized: options.date,
      },
    })
    .toBuffer()

  await writeFile(filePath, output)
}
