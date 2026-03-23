import { useEffect, useRef, useState, useCallback } from "react"
import type { CountryCode } from "../data/travel"
import { capture } from "../utils/analytics"
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

  const [imageLoading, setImageLoading] = useState(false)
  const prevSrc = useRef<string | undefined>(undefined)
  const loadingTimer = useRef<number | null>(null)

  // Only show loading state if the image takes >150ms to load
  if (currentItem?.src !== prevSrc.current) {
    prevSrc.current = currentItem?.src
    if (loadingTimer.current) clearTimeout(loadingTimer.current)
    if (currentItem?.src) {
      loadingTimer.current = window.setTimeout(() => setImageLoading(true), 150)
    }
  }

  const onImageLoad = useCallback(() => {
    if (loadingTimer.current) clearTimeout(loadingTimer.current)
    loadingTimer.current = null
    setImageLoading(false)
  }, [])

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
        capture("travel_gallery_open", { country: detail.countryCode })
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
      capture("travel_gallery_close", { country: currentCountry })
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
              onClick={() => { prev(); capture("travel_gallery_navigate", { direction: "prev" }) }}
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
            {imageLoading && (
              <div className={styles.loader}>
                <div className={styles.spinner} />
              </div>
            )}
            <img
              src={currentItem?.src}
              className={`${styles.image} ${imageLoading ? styles.imageLoading : ""}`}
              onLoad={onImageLoad}
              alt=""
            />
            <button
              className={`${styles.navButton} ${styles.navNext}`}
              onClick={() => { next(); capture("travel_gallery_navigate", { direction: "next" }) }}
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
                    capture("travel_gallery_switch_country", { country: code })
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
