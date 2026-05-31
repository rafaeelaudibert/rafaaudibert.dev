import { useEffect } from "react"
import ImageGallery, { type GalleryImage } from "../ImageGallery"
import { capture } from "../../utils/analytics"

interface ChangelogGalleryProps {
  galleries: Record<string, GalleryImage[]>
  labels: Record<string, string>
}

export default function ChangelogGallery({
  galleries,
  labels,
}: ChangelogGalleryProps) {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest("[data-gallery-open]")
      if (!target) return

      const galleryId = target.getAttribute("data-gallery-open")
      if (!galleryId) return

      const imageIndex = Number(target.getAttribute("data-image-index") ?? "0")

      document.dispatchEvent(
        new CustomEvent("gallery:open", {
          detail: { galleryId, imageIndex },
        }),
      )
    }

    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  if (Object.keys(galleries).length === 0) return null

  return (
    <ImageGallery
      galleries={galleries}
      labels={labels}
      ariaLabel="Changelog photo gallery"
      onOpen={(galleryId) => capture("changelog_gallery_open", { entry: galleryId })}
      onClose={(galleryId) => capture("changelog_gallery_close", { entry: galleryId })}
      onNavigate={(direction) => capture("changelog_gallery_navigate", { direction })}
    />
  )
}
