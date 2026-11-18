import { stat } from "node:fs/promises"
import { basename, join } from "node:path"
import { getImage } from "astro:assets"
import { COUNTRY_CODE_TO_LONG_NAME } from "./countries"
import {
  buildTravelImageAlt,
  readTravelImageExif,
} from "../utils/travelImageExif"

export type TravelPhoto = {
  /** The original's file name, kept as the analytics photo_id */
  id: string
  /** The untouched file, EXIF included, offered as a download */
  originalSrc: string
  originalName: string
  originalBytes: number
  /** Resized copy the gallery shows by default, and the srcset around it */
  gallerySrc: string
  gallerySrcSet: string
  placeholderSrc: string
  placeholderGallerySrc: string
  width: number
  height: number
  alt: string
  description?: string
  countryCode: string
  date: string
}

export type TravelGalleryImage = {
  id: string
  src: string
  srcSet: string
  originalSrc: string
  originalName: string
  originalBytes: number
  placeholderSrc: string
  width: number
  height: number
  alt: string
  description?: string
}

const DATA_DIR = join(process.cwd(), "src")

function globPathToFilePath(globPath: string): string {
  return join(DATA_DIR, globPath.replace(/^\.\.\//, ""))
}

function formatDate(dateStr: string) {
  return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
}

const travelImageModules = import.meta.glob<{ default: ImageMetadata }>(
  "../assets/travel/**/*.webp",
  { eager: true },
)

// The originals are camera-sized (often 5000px+ and several MB). The gallery
// frame is at most 1100 CSS px wide, so 2400px covers it on a 2x screen.
const GALLERY_WIDTHS = [640, 1024, 1600, 2400]

async function buildPlaceholders(image: ImageMetadata) {
  const { width } = image
  const [thumb, gallery, full] = await Promise.all([
    getImage({
      src: image,
      width: 48,
      height: 48,
      format: "webp",
      quality: 30,
    }),
    // Width only, so the blur keeps the photo's shape under the full image
    getImage({
      src: image,
      width: 64,
      format: "webp",
      quality: 25,
    }),
    getImage({
      src: image,
      width: Math.min(1600, width),
      // Smaller photos stop at their own width rather than being upscaled
      widths: [...new Set(GALLERY_WIDTHS.map((w) => Math.min(w, width)))],
      format: "webp",
      quality: 80,
    }),
  ])

  return {
    placeholderSrc: thumb.src,
    placeholderGallerySrc: gallery.src,
    gallerySrc: full.src,
    gallerySrcSet: full.srcSet.attribute,
  }
}

async function buildTravelPhotos(): Promise<TravelPhoto[]> {
  const photos: TravelPhoto[] = []

  for (const [path, mod] of Object.entries(travelImageModules)) {
    const match = path.match(/\/travel\/([A-Z]{2})\/(\d{8})_/)
    if (!match) continue

    const [, countryCode, dateStr] = match
    const countryName =
      COUNTRY_CODE_TO_LONG_NAME[
        countryCode as keyof typeof COUNTRY_CODE_TO_LONG_NAME
      ] ?? countryCode

    const filePath = globPathToFilePath(path)
    const exif = await readTravelImageExif(filePath).catch(() => null)
    const fallbackAlt = `${countryName}, ${formatDate(dateStr)}`
    const description = exif?.description ?? undefined
    const alt = buildTravelImageAlt(description ?? null, fallbackAlt)
    const placeholders = await buildPlaceholders(mod.default)
    // Reading src is also what makes Astro ship the original file: the
    // gallery shows resized copies and links here for the full-quality one
    const { src: originalSrc, width, height } = mod.default
    const { size: originalBytes } = await stat(filePath)

    photos.push({
      id: originalSrc.split("/").pop() ?? originalSrc,
      originalSrc,
      originalName: basename(filePath),
      originalBytes,
      ...placeholders,
      width,
      height,
      alt,
      description,
      countryCode,
      date: dateStr,
    })
  }

  return photos.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date)
    if (byDate !== 0) return byDate
    return a.id.localeCompare(b.id)
  })
}

export const travelPhotos = await buildTravelPhotos()

export const imagesByCountry: Record<string, TravelGalleryImage[]> =
  Object.fromEntries(
    Object.entries(
      Object.groupBy(travelPhotos, (photo) => photo.countryCode),
    ).map(([code, photos]) => [
      code,
      (photos ?? []).map(
        ({
          id,
          originalSrc,
          originalName,
          originalBytes,
          gallerySrc,
          gallerySrcSet,
          placeholderGallerySrc,
          width,
          height,
          alt,
          description,
        }) => ({
          id,
          originalSrc,
          originalName,
          originalBytes,
          src: gallerySrc,
          srcSet: gallerySrcSet,
          placeholderSrc: placeholderGallerySrc,
          width,
          height,
          alt,
          description,
        }),
      ),
    ]),
  )
