import type { CountryCode } from "../data/travel"
import type { TravelGalleryImage } from "../data/travelPhotos"
import { capture } from "../utils/analytics"
import ImageGallery, { type GalleryImage } from "./ImageGallery"
import styles from "./TravelGallery.module.css"

interface TravelGalleryProps {
  imagesByCountry: Partial<Record<CountryCode, TravelGalleryImage[]>>
  countryMeta: Partial<Record<CountryCode, { name: string; flag: string }>>
}

export default function TravelGallery({
  imagesByCountry,
  countryMeta,
}: TravelGalleryProps) {
  const galleries = Object.fromEntries(
    Object.entries(imagesByCountry).map(([code, images]) => [
      code,
      images.map((image) => ({
        src: image.src,
        alt: image.alt,
        description: image.description,
        placeholderSrc: image.placeholderSrc,
        width: image.width,
        height: image.height,
      })),
    ]),
  ) as Record<string, GalleryImage[]>

  const labels = Object.fromEntries(
    Object.entries(countryMeta).map(([code, meta]) => [
      code,
      `${meta?.flag ?? ""} ${meta?.name ?? code}`.trim(),
    ]),
  )

  const countryCodes = (Object.keys(imagesByCountry) as CountryCode[]).sort(
    (a, b) => (countryMeta[a]?.name ?? a).localeCompare(countryMeta[b]?.name ?? b),
  )

  return (
    <ImageGallery
      galleries={galleries}
      labels={labels}
      openEvent="travel:open-gallery"
      ariaLabel="Travel photo gallery"
      onOpen={(galleryId) => capture("gallery opened", { surface: "travel", country: galleryId })}
      onClose={(galleryId) => capture("gallery closed", { surface: "travel", country: galleryId })}
      onNavigate={(direction) => capture("gallery navigated", { surface: "travel", direction })}
      onViewImage={(image, index, galleryId) =>
        capture("photo viewed", {
          surface: "travel",
          photo_id: image.src.split("/").pop(),
          photo_title: image.alt || image.description,
          photo_src: image.src,
          photo_index: index,
          country: galleryId,
          country_name: countryMeta[galleryId as CountryCode]?.name,
        })
      }
      footer={({ galleryId, setGalleryId, setIndex }) =>
        countryCodes.length > 1 ? (
          <>
            {countryCodes.map((code) => (
              <button
                key={code}
                type="button"
                className={`${styles.countryChip} ${code === galleryId ? styles.countryChipActive : ""}`}
                onClick={() => {
                  setGalleryId(code)
                  setIndex(0)
                  capture("gallery country switched", { country: code })
                }}
              >
                {countryMeta[code]?.flag} {countryMeta[code]?.name}
              </button>
            ))}
          </>
        ) : null
      }
    />
  )
}
