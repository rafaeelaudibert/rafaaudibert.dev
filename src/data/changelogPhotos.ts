import type { ImageMetadata } from "astro"
import { travelPhotos } from "./travelPhotos"

export type ChangelogPhoto = {
  src: ImageMetadata
  placeholderSrc: string
  placeholderGallerySrc: string
  alt: string
  description?: string
}

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const

function entryKey(year: number, month: string) {
  return `${year}-${month.toLowerCase()}`
}

function buildPhotosByEntryKey(): Record<string, ChangelogPhoto[]> {
  const map: Record<string, Array<ChangelogPhoto & { date: string }>> = {}

  for (const photo of travelPhotos) {
    const year = Number(photo.date.slice(0, 4))
    const monthIndex = Number(photo.date.slice(4, 6)) - 1
    if (monthIndex < 0 || monthIndex > 11) continue

    const month = MONTH_NAMES[monthIndex]
    const key = entryKey(year, month)

    if (!map[key]) map[key] = []
    map[key].push({
      src: photo.image,
      placeholderSrc: photo.placeholderSrc,
      placeholderGallerySrc: photo.placeholderGallerySrc,
      alt: photo.alt,
      description: photo.description,
      date: photo.date,
    })
  }

  return Object.fromEntries(
    Object.entries(map).map(([key, photos]) => [
      key,
      photos
        .sort((a, b) => a.date.localeCompare(b.date))
        .map(({ src, placeholderSrc, placeholderGallerySrc, alt, description }) => ({
          src,
          placeholderSrc,
          placeholderGallerySrc,
          alt,
          description,
        })),
    ]),
  )
}

export const photosByEntryKey = buildPhotosByEntryKey()

let activeYear: number | undefined

export function resolveChangelogEntry(month: string, year?: number) {
  if (year !== undefined) activeYear = year

  const resolvedYear = year ?? activeYear
  const id = resolvedYear
    ? entryKey(resolvedYear, month)
    : month.toLowerCase()
  const photos = resolvedYear ? (photosByEntryKey[id] ?? []) : []
  const galleryLabel = resolvedYear ? `${month} ${resolvedYear}` : month

  return { entryId: id, photos, galleryLabel }
}

export const changelogGalleries = Object.fromEntries(
  Object.entries(photosByEntryKey).map(([key, photos]) => [
    key,
    photos.map((photo) => ({
      src: photo.src.src,
      placeholderSrc: photo.placeholderGallerySrc,
      alt: photo.alt,
      description: photo.description,
      width: photo.src.width,
      height: photo.src.height,
    })),
  ]),
)

export const changelogGalleryLabels = Object.fromEntries(
  Object.keys(photosByEntryKey).map((key) => {
    const [year, month] = key.split("-")
    const label = month
      ? `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`
      : key
    return [key, label]
  }),
)
