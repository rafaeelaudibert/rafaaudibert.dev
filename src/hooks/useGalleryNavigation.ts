import { useCallback, useEffect, useRef, useState } from "react"

interface GalleryNavigation<T> {
  currentIndex: number
  setCurrentIndex: (index: number) => void
  currentItem: T | undefined
  prev: () => void
  next: () => void
  hasMultiple: boolean
  swipeProps: {
    onPointerDown: (e: React.PointerEvent) => void
    onPointerUp: (e: React.PointerEvent) => void
    style: { touchAction: string }
  }
}

export function useGalleryNavigation<T>(
  items: T[],
  dialogOpen: boolean
): GalleryNavigation<T> {
  const [currentIndex, setCurrentIndex] = useState(0)

  const prev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : items.length - 1))
  }, [items.length])

  const next = useCallback(() => {
    setCurrentIndex((i) => (i < items.length - 1 ? i + 1 : 0))
  }, [items.length])

  // Arrow key navigation
  useEffect(() => {
    if (!dialogOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev()
      else if (e.key === "ArrowRight") next()
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [prev, next, dialogOpen])

  // Swipe navigation
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  const swipeProps = {
    onPointerDown: (e: React.PointerEvent) => {
      swipeStart.current = { x: e.clientX, y: e.clientY }
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!swipeStart.current) return
      const dx = e.clientX - swipeStart.current.x
      const dy = e.clientY - swipeStart.current.y
      swipeStart.current = null
      if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return
      if (dx < 0) next()
      else prev()
    },
    style: { touchAction: "pan-y" as const },
  }

  return {
    currentIndex,
    setCurrentIndex,
    currentItem: items[currentIndex],
    prev,
    next,
    hasMultiple: items.length > 1,
    swipeProps,
  }
}
