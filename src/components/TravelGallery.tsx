import { useEffect, useRef, useState } from "react"
import type { CountryCode } from "../data/travel"
import { useGalleryNavigation } from "../hooks/useGalleryNavigation"
import styles from "./TravelGallery.module.css"

interface TravelGalleryProps {
  imagesByCountry: Partial<Record<CountryCode, Array<{ src: string }>>>
  countryMeta: Partial<Record<CountryCode, { name: string; flag: string }>>
}

export default function TravelGallery({
  imagesByCountry,
  countryMeta,
}: TravelGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [currentCountry, setCurrentCountry] = useState<CountryCode | null>(null)

  const images = currentCountry
    ? (imagesByCountry[currentCountry] ?? [])
    : []
  const countryCodes = (Object.keys(imagesByCountry) as CountryCode[]).sort(
    (a, b) => (countryMeta[a]?.name ?? a).localeCompare(countryMeta[b]?.name ?? b)
  )
  const meta = currentCountry ? countryMeta[currentCountry] : null
  const isOpen = currentCountry !== null && images.length > 0

  const {
    currentIndex,
    setCurrentIndex,
    currentItem,
    prev,
    next,
    hasMultiple,
    swipeProps,
  } = useGalleryNavigation(images, isOpen)

  // Listen for custom event from country cards / globe photo popups
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as {
        countryCode: CountryCode
        imageIndex?: number
      }
      if (imagesByCountry[detail.countryCode]?.length) {
        setCurrentCountry(detail.countryCode)
        setCurrentIndex(detail.imageIndex ?? 0)
        document.documentElement.style.overflow = "hidden"
        dialogRef.current?.showModal()
      }
    }

    document.addEventListener("travel:open-gallery", handler)
    return () => document.removeEventListener("travel:open-gallery", handler)
  }, [imagesByCountry])

  // Sync state when dialog is closed (Escape key / close button)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const onClose = () => {
      setCurrentCountry(null)
      document.documentElement.style.overflow = ""
    }
    dialog.addEventListener("close", onClose)
    return () => dialog.removeEventListener("close", onClose)
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Travel photo gallery"
    >
      {isOpen && (
        <div className={styles.content}>
          {meta && (
            <span className={styles.countryFlag}>
              {meta.flag} {meta.name}
            </span>
          )}
          <button
            className={styles.close}
            onClick={() => dialogRef.current?.close()}
            aria-label="Close gallery"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className={styles.imageContainer} {...swipeProps}>
            <button
              className={`${styles.navButton} ${styles.navPrev}`}
              onClick={prev}
              disabled={!hasMultiple}
              aria-label="Previous image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <img
              src={currentItem?.src}
              className={styles.image}
              alt=""
            />
            <button
              className={`${styles.navButton} ${styles.navNext}`}
              onClick={next}
              disabled={!hasMultiple}
              aria-label="Next image"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          <div className={styles.counter}>
            {currentIndex + 1} / {images.length}
          </div>
          {countryCodes.length > 1 && (
            <div className={styles.countryNav}>
              {countryCodes.map((code) => (
                <button
                  key={code}
                  className={`${styles.countryChip} ${code === currentCountry ? styles.countryChipActive : ""}`}
                  onClick={() => {
                    setCurrentCountry(code)
                    setCurrentIndex(0)
                  }}
                >
                  {countryMeta[code]?.flag} {countryMeta[code]?.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
