import { join } from "node:path"
import { getImage, type ImageMetadata } from "astro:assets"
import { COUNTRY_CODE_TO_LONG_NAME } from "./countries"
import {
  buildTravelImageAlt,
  readTravelImageExif,
} from "../utils/travelImageExif"

export type TravelPhoto = {
  image: ImageMetadata
  src: string
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
  src: string
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

async function buildPlaceholders(image: ImageMetadata) {
  const [thumb, gallery] = await Promise.all([
    getImage({
      src: image,
      width: 48,
      height: 48,
      format: "webp",
      quality: 30,
    }),
    getImage({
      src: image,
      width: 64,
      height: 64,
      format: "webp",
      quality: 25,
    }),
  ])

  return {
    placeholderSrc: thumb.src,
    placeholderGallerySrc: gallery.src,
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

    photos.push({
      image: mod.default,
      src: mod.default.src,
      ...placeholders,
      width: mod.default.width,
      height: mod.default.height,
      alt,
      description,
      countryCode,
      date: dateStr,
    })
  }

  return photos.sort((a, b) => {
    const byDate = a.date.localeCompare(b.date)
    if (byDate !== 0) return byDate
    return a.src.localeCompare(b.src)
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
        ({ src, placeholderGallerySrc, width, height, alt, description }) => ({
          src,
          placeholderSrc: placeholderGallerySrc,
          width,
          height,
          alt,
          description,
        }),
      ),
    ]),
  )
