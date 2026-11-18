import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { useGalleryNavigation } from "../hooks/useGalleryNavigation"
import styles from "./ImageGallery.module.css"

export type GalleryImage = {
  /** Stable name for analytics; src may point at a resized copy */
  id?: string
  src: string
  srcSet?: string
  /** Full-quality file offered as a download, next to the counter */
  originalSrc?: string
  /** File name to save it under */
  originalName?: string
  originalBytes?: number
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
  /**
   * Fired whenever a different image becomes visible, whichever way the user
   * got there - buttons, arrow keys, swipe, opening, or switching gallery.
   */
  onViewImage?: (image: GalleryImage, index: number, galleryId: string) => void
  onDownload?: (image: GalleryImage, index: number, galleryId: string) => void
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
  onViewImage,
  onDownload,
}: ImageGalleryProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [galleryId, setGalleryId] = useState<string | null>(null)
  // The src that finished loading, not a boolean: a boolean is still true for
  // the first render after moving on, so the new photo would skip its fade
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

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

  const fullImageLoaded = loadedSrc !== null && loadedSrc === currentItem?.src
  const hasPlaceholder = Boolean(currentItem?.placeholderSrc)
  const showSpinner = !fullImageLoaded && !hasPlaceholder
  const aspectRatio = aspectRatioOf(currentItem)

  const markLoaded = useCallback((src: string) => setLoadedSrc(src), [])

  // A photo already in the cache (usually because it was preloaded below) is
  // complete as soon as it mounts: show it at once instead of fading it in
  const fullImageRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) {
      setLoadedSrc(img.dataset.src ?? null)
    }
  }, [])

  // Once the visible photo is in, fetch its neighbours so the next tap is
  // instant. Waiting keeps them from competing with the one being looked at.
  useEffect(() => {
    if (!isOpen || !fullImageLoaded || images.length < 2) return
    const neighbours = new Set([
      images[(currentIndex + 1) % images.length],
      images[(currentIndex - 1 + images.length) % images.length],
    ])
    for (const image of neighbours) preloadImage(image)
  }, [isOpen, fullImageLoaded, currentIndex, images])

  useEffect(() => {
    if (!isOpen || !currentItem || !galleryId) return
    onViewImage?.(currentItem, currentIndex, galleryId)
    // Keyed on src so re-renders that leave the same image visible stay quiet.
  }, [isOpen, galleryId, currentItem?.src]) // eslint-disable-line react-hooks/exhaustive-deps

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
                // Keyed so the old photo's blur is dropped right away instead
                // of staying on screen until the new one has downloaded
                <img
                  key={currentItem.placeholderSrc}
                  src={currentItem.placeholderSrc}
                  className={styles.placeholderImage}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
              )}
              <img
                key={currentItem?.src}
                ref={fullImageRef}
                data-src={currentItem?.src}
                sizes={currentItem?.srcSet ? sizesFor(aspectRatio) : undefined}
                srcSet={currentItem?.srcSet || undefined}
                src={currentItem?.src}
                className={`${styles.image} ${fullImageLoaded ? styles.imageLoaded : ""}`}
                onLoad={() => currentItem && markLoaded(currentItem.src)}
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
          <div className={styles.meta}>
            <span className={styles.counter}>
              {currentIndex + 1} / {images.length}
            </span>
            {currentItem?.originalSrc && (
              <a
                className={styles.download}
                href={currentItem.originalSrc}
                download={currentItem.originalName ?? ""}
                onClick={() =>
                  galleryId && onDownload?.(currentItem, currentIndex, galleryId)
                }
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 4v11" />
                  <polyline points="7 10 12 15 17 10" />
                  <path d="M5 20h14" />
                </svg>
                Download original{" "}
                {currentItem.originalBytes ? (
                  <span className={styles.downloadSize}>
                    {formatBytes(currentItem.originalBytes)}
                  </span>
                ) : null}
              </a>
            )}
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

function aspectRatioOf(image: GalleryImage | undefined) {
  return image?.width && image?.height ? image.width / image.height : undefined
}

/**
 * How wide the photo is drawn, mirroring .imageFrameSized: the frame is at
 * most min(95vw, 1100px) wide and 65vh tall, so portrait photos are bound by
 * height. Getting this right is what stops a phone downloading the 2400px copy.
 */
function sizesFor(aspectRatio: number | undefined) {
  if (aspectRatio && aspectRatio < 1) {
    return `${Math.ceil(65 * aspectRatio)}vh`
  }
  return "(max-width: 1158px) 95vw, 1100px"
}

function preloadImage(image: GalleryImage) {
  if (image.placeholderSrc) new Image().src = image.placeholderSrc
  const img = new Image()
  // sizes before srcset, or the browser may pick a candidate without it
  if (image.srcSet) {
    img.sizes = sizesFor(aspectRatioOf(image))
    img.srcset = image.srcSet
  }
  img.src = image.src
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
