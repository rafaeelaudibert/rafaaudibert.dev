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
      onOpen={(galleryId) => capture("gallery opened", { surface: "changelog", entry: galleryId })}
      onClose={(galleryId) => capture("gallery closed", { surface: "changelog", entry: galleryId })}
      onNavigate={(direction) => capture("gallery navigated", { surface: "changelog", direction })}
      onViewImage={(image, index, galleryId) =>
        capture("photo viewed", {
          surface: "changelog",
          photo_id: image.src.split("/").pop(),
          photo_title: image.alt || image.description,
          photo_src: image.src,
          photo_index: index,
          entry: galleryId,
        })
      }
    />
  )
}
