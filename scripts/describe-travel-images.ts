/**
 * Walk through travel images, preview them in the terminal, and write EXIF descriptions.
 *
 * Required description format (stored in ImageDescription):
 *   <Subject>, <context>
 *
 * Usage:
 *   bun run describe-images                 Images missing a valid description
 *   bun run describe-images --all           Include images that already have one
 *   bun run describe-images --check         Exit 1 if any image is missing/invalid
 */

import { spawnSync } from "node:child_process"
import { createInterface } from "node:readline"
import { stat } from "node:fs/promises"
import sharp from "sharp"
import { COUNTRY_CODE_TO_LONG_NAME } from "../src/data/countries"
import {
  isValidTravelImageDescription,
  readTravelImageExif,
  resolveTravelImageDate,
  TRAVEL_IMAGE_DESCRIPTION_HELP,
  validateTravelImageDescription,
  writeTravelImageExif,
} from "../src/utils/travelImageExif"
import {
  countryCodeFromTravelPath,
  formatTravelDate,
  getTravelImageFiles,
  relativeTravelPath,
  TRAVEL_DIR,
} from "../src/utils/travelImages"

const INCLUDE_ALL = process.argv.includes("--all")
const CHECK_MODE = process.argv.includes("--check")

const rl = CHECK_MODE
  ? null
  : createInterface({ input: process.stdin, output: process.stdout })

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl!.question(question, (answer) => resolve(answer.trim()))
  })
}

function commandExists(command: string): boolean {
  const result = spawnSync("sh", ["-c", `command -v ${command}`], {
    stdio: "ignore",
  })
  return result.status === 0
}

function renderWithCommand(
  command: string,
  args: string[],
): boolean {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
  })
  return result.status === 0
}

function getPixel(
  data: Buffer,
  width: number,
  channels: number,
  x: number,
  y: number,
): [number, number, number] {
  const index = (y * width + x) * channels
  return [data[index] ?? 0, data[index + 1] ?? 0, data[index + 2] ?? 0]
}

async function renderAnsiPreview(
  file: string,
  maxWidth = 56,
  maxLines = 18,
): Promise<string> {
  const pixelHeight = maxLines * 2
  const { data, info } = await sharp(file)
    .rotate()
    .resize(maxWidth, pixelHeight, { fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const lines: string[] = []

  for (let y = 0; y < height; y += 2) {
    let line = ""
    for (let x = 0; x < width; x++) {
      const top = getPixel(data, width, channels, x, y)
      const bottom =
        y + 1 < height
          ? getPixel(data, width, channels, x, y + 1)
          : ([0, 0, 0] as [number, number, number])

      line += `\x1b[38;2;${top[0]};${top[1]};${top[2]};48;2;${bottom[0]};${bottom[1]};${bottom[2]}m\u2580`
    }
    line += "\x1b[0m"
    lines.push(line)
  }

  return lines.join("\n")
}

async function renderImagePreview(file: string): Promise<void> {
  if (commandExists("chafa")) {
    console.log("Preview (chafa):")
    if (
      renderWithCommand("chafa", [
        "--size",
        "56x18",
        "--format",
        "symbols",
        file,
      ])
    ) {
      return
    }
  }

  if (commandExists("viu")) {
    console.log("Preview (viu):")
    if (renderWithCommand("viu", ["-w", "56", file])) {
      return
    }
  }

  if (process.env.KITTY_WINDOW_ID && commandExists("kitty")) {
    console.log("Preview (kitty icat):")
    if (renderWithCommand("kitty", ["+kitten", "icat", file])) {
      return
    }
  }

  console.log("Preview (ANSI fallback — install `chafa` for a nicer preview):")
  console.log(await renderAnsiPreview(file))
}

function countryLabel(file: string): string | null {
  const code = countryCodeFromTravelPath(file)
  if (!code) return null
  return (
    COUNTRY_CODE_TO_LONG_NAME[code as keyof typeof COUNTRY_CODE_TO_LONG_NAME] ??
    code
  )
}

async function promptForDescription(
  current: string | null,
): Promise<string | null | "skip" | "quit"> {
  while (true) {
    const answer = await ask(
      current
        ? "New description (Enter=keep current, s=skip, q=quit, ?=help): "
        : "Description (s=skip, q=quit, ?=help): ",
    )

    if (answer === "q") return "quit"
    if (answer === "s") return "skip"
    if (answer === "?") {
      console.log(`\n${TRAVEL_IMAGE_DESCRIPTION_HELP}\n`)
      continue
    }

    if (!answer && current && isValidTravelImageDescription(current)) {
      return current
    }

    if (!answer) {
      console.log("  Please enter a description in the required format.\n")
      continue
    }

    const validated = validateTravelImageDescription(answer)
    if (!validated.ok) {
      console.log(`  ${validated.error}\n`)
      continue
    }

    return validated.value
  }
}

async function main() {
  const files = await getTravelImageFiles()

  if (files.length === 0) {
    console.log(`No travel images found in ${TRAVEL_DIR}`)
    process.exit(0)
  }

  const inventory = await Promise.all(
    files.map(async (file) => {
      const exif = await readTravelImageExif(file).catch(() => null)
      return { file, exif }
    }),
  )

  if (CHECK_MODE) {
    let invalid = 0

    for (const { file, exif } of inventory) {
      const rel = relativeTravelPath(file)
      if (isValidTravelImageDescription(exif?.description)) continue

      invalid++
      const reason = exif?.description
        ? `invalid description: "${exif.description}"`
        : "missing description"
      console.log(`  FAIL  ${rel} — ${reason}`)
    }

    if (invalid > 0) {
      console.log(
        `\n${invalid} image(s) are missing a valid description.`,
      )
      console.log("Run: bun run describe-images")
      process.exit(1)
    }

    console.log(`All ${files.length} travel images have valid descriptions.`)
    process.exit(0)
  }

  const queue = inventory.filter(({ exif }) =>
    INCLUDE_ALL
      ? true
      : !isValidTravelImageDescription(exif?.description),
  )

  console.log(TRAVEL_IMAGE_DESCRIPTION_HELP)
  console.log(
    `\nFound ${files.length} image(s). Reviewing ${queue.length} of them.\n`,
  )

  if (queue.length === 0) {
    console.log("Nothing to do. Use --all to review existing descriptions.")
    rl?.close()
    process.exit(0)
  }

  let saved = 0
  let skipped = 0

  for (let index = 0; index < queue.length; index++) {
    const { file, exif } = queue[index]!
    const rel = relativeTravelPath(file)
    const metadata = await sharp(file).metadata()
    const fileSize = await stat(file).then((entry) => entry.size)
    const date = resolveTravelImageDate(file, exif)
    const country = countryLabel(file)

    console.log("\n" + "═".repeat(64))
    console.log(`[${index + 1}/${queue.length}] ${rel}`)
    console.log(`Date taken: ${formatTravelDate(date)}`)
    if (country) console.log(`Country: ${country}`)
    console.log(
      `Dimensions: ${metadata.width ?? "?"}×${metadata.height ?? "?"} · ${(fileSize / 1024).toFixed(0)}KB`,
    )
    console.log(
      `Current description: ${
        exif?.description ? `"${exif.description}"` : "(none)"
      }`,
    )
    console.log("═".repeat(64))

    await renderImagePreview(file)
    console.log("")

    const result = await promptForDescription(exif?.description ?? null)

    if (result === "quit") {
      console.log("Stopping early.")
      break
    }

    if (result === "skip") {
      console.log("  Skipped.")
      skipped++
      continue
    }

    if (result === exif?.description && isValidTravelImageDescription(result)) {
      console.log("  Kept existing description.")
      skipped++
      continue
    }

    try {
      await writeTravelImageExif(file, { date, description: result })
      console.log(`  Saved: "${result}"`)
      saved++
    } catch (error) {
      console.error(`  ERROR: ${error}`)
    }
  }

  rl?.close()
  console.log(`\nDone. ${saved} saved, ${skipped} skipped.`)
}

main()
