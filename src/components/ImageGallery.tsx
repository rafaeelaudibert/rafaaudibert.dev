import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useGalleryNavigation } from "../hooks/useGalleryNavigation"
import styles from "./ImageGallery.module.css"

export type GalleryImage = {
  src: string
  alt?: string
  description?: string
  placeholderSrc?: string
  width?: number
  height?: number
}

export interface GalleryOpenDetail {
  galleryId?: string
  countryCode?: string
  imageIndex?: number
}

interface ImageGalleryProps {
  galleries: Record<string, GalleryImage[]>
  labels?: Record<string, string>
  openEvent?: string
  ariaLabel?: string
  footer?: (ctx: {
    galleryId: string
    setGalleryId: (id: string) => void
    setIndex: (index: number) => void
  }) => ReactNode
  onOpen?: (galleryId: string) => void
  onClose?: (galleryId: string | null) => void
  onNavigate?: (direction: "prev" | "next") => void
}

export default function ImageGallery({
  galleries,
  labels = {},
  openEvent = "gallery:open",
  ariaLabel = "Photo gallery",
  footer,
  onOpen,
  onClose,
  onNavigate,
}: ImageGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [galleryId, setGalleryId] = useState<string | null>(null)
  const [fullImageLoaded, setFullImageLoaded] = useState(false)

  const images = galleryId ? (galleries[galleryId] ?? []) : []
  const label = galleryId ? labels[galleryId] : undefined
  const isOpen = galleryId !== null && images.length > 0

  const {
    currentIndex,
    setCurrentIndex,
    currentItem,
    prev,
    next,
    hasMultiple,
    swipeProps,
  } = useGalleryNavigation(images, isOpen)

  const hasPlaceholder = Boolean(currentItem?.placeholderSrc)
  const showSpinner = !fullImageLoaded && !hasPlaceholder
  const aspectRatio =
    currentItem?.width && currentItem?.height
      ? currentItem.width / currentItem.height
      : undefined

  useEffect(() => {
    setFullImageLoaded(false)
  }, [currentItem?.src])

  const onImageLoad = useCallback(() => {
    setFullImageLoaded(true)
  }, [])

  const openGallery = useCallback(
    (id: string, imageIndex = 0) => {
      if (!galleries[id]?.length) return
      setGalleryId(id)
      setCurrentIndex(imageIndex)
      document.documentElement.style.overflow = "hidden"
      dialogRef.current?.showModal()
      onOpen?.(id)
    },
    [galleries, onOpen, setCurrentIndex],
  )

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<GalleryOpenDetail>).detail
      const id = detail?.galleryId ?? detail?.countryCode
      if (id) {
        openGallery(id, detail.imageIndex ?? 0)
      }
    }

    document.addEventListener(openEvent, handler)
    return () => document.removeEventListener(openEvent, handler)
  }, [openEvent, openGallery])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => {
      onClose?.(galleryId)
      setGalleryId(null)
      document.documentElement.style.overflow = ""
    }
    dialog.addEventListener("close", handleClose)
    return () => dialog.removeEventListener("close", handleClose)
  }, [galleryId, onClose])

  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-label={ariaLabel}>
      {isOpen && (
        <div className={styles.content}>
          {label && <span className={styles.header}>{label}</span>}
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
              onClick={() => {
                prev()
                onNavigate?.("prev")
              }}
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
            <div
              className={`${styles.imageFrame} ${aspectRatio ? styles.imageFrameSized : ""}`}
              style={
                aspectRatio
                  ? ({ "--aspect-ratio": String(aspectRatio) } as React.CSSProperties)
                  : undefined
              }
            >
              {showSpinner && (
                <div className={styles.loader}>
                  <div className={styles.spinner} />
                </div>
              )}
              {currentItem?.placeholderSrc && (
                <img
                  src={currentItem.placeholderSrc}
                  className={styles.placeholderImage}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
              )}
              <img
                key={currentItem?.src}
                src={currentItem?.src}
                className={`${styles.image} ${fullImageLoaded ? styles.imageLoaded : ""}`}
                onLoad={onImageLoad}
                alt={currentItem?.alt ?? ""}
                draggable={false}
              />
            </div>
            <button
              className={`${styles.navButton} ${styles.navNext}`}
              onClick={() => {
                next()
                onNavigate?.("next")
              }}
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
          {currentItem?.description && (
            <p className={styles.caption}>{currentItem.description}</p>
          )}
          {footer && galleryId && (
            <div className={styles.footer}>
              {footer({
                galleryId,
                setGalleryId: (id) => {
                  setGalleryId(id)
                  setCurrentIndex(0)
                },
                setIndex: setCurrentIndex,
              })}
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
