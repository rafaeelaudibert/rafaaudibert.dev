import { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"
import type { AirportCode, CountryCode } from "../data/travel"
import { joinerWithAnd } from "../utils/string"
import styles from "./TravelGlobe.module.css"

interface MarkerInfo {
  location: [number, number]
  size: number
  id: AirportCode
  label: string
  countryCode: CountryCode
  fullName: string
  countryName: string
  flag: string
  years: number[]
}

interface ArcInfo {
  from: [number, number]
  to: [number, number]
  fromCode: AirportCode
  toCode: AirportCode
}

interface TravelGlobeProps {
  markers: MarkerInfo[]
  arcs: ArcInfo[]
  imagesByCountry?: Partial<Record<CountryCode, Array<{ src: string }>>>
}
const GLOBE_HEIGHT = 600
const INITIAL_PHI = -0.9 // mid-Atlantic between Americas and Europe
const INITIAL_THETA = 0.2
const ARC_GROW_SPEED = 1 / 40 // progress per frame (0→1), 40 frames ≈ 670ms per arc
const ARC_PAUSE_FRAMES = 30 // ~0.5s pause between arcs
const toRad = (d: number) => (d * Math.PI) / 180

// Interpolate a point along the great circle from A to B at parameter t (0→1)
function interpolateGreatCircle(
  from: [number, number],
  to: [number, number],
  t: number
): [number, number] {
  const lat1 = toRad(from[0]),
    lng1 = toRad(from[1])
  const lat2 = toRad(to[0]),
    lng2 = toRad(to[1])
  const d = Math.acos(
    Math.min(
      1,
      Math.max(
        -1,
        Math.sin(lat1) * Math.sin(lat2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1)
      )
    )
  )
  if (d < 1e-6) return to
  const A = Math.sin((1 - t) * d) / Math.sin(d)
  const B = Math.sin(t * d) / Math.sin(d)
  const x =
    A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2)
  const y =
    A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2)
  const z = A * Math.sin(lat1) + B * Math.sin(lat2)
  return [
    (Math.atan2(z, Math.sqrt(x * x + y * y)) * 180) / Math.PI,
    (Math.atan2(y, x) * 180) / Math.PI,
  ]
}

function anchorCss(id: string, extra: string[] = []): string {
  return [
    "position: absolute",
    `position-anchor: --cobe-${id}`,
    "bottom: anchor(top)",
    "left: anchor(center)",
    "translate: -50% 0",
    `opacity: var(--cobe-visible-${id}, 0)`,
    ...extra,
  ].join(";")
}

export default function TravelGlobe({
  markers,
  arcs,
  imagesByCountry,
}: TravelGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractingY = useRef<number>(0)
  const movementX = useRef(0)
  const movementY = useRef(0)
  const phiRef = useRef(INITIAL_PHI)
  const scaleRef = useRef(1)
  const widthRef = useRef(0)
  const [isDark, setIsDark] = useState(false)
  const [hoveredMarker, setHoveredMarker] = useState<MarkerInfo | null>(null)
  const [completedFlights, setCompletedFlights] = useState<
    Array<{ from: AirportCode; to: AirportCode }>
  >([])

  // Theme detection
  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("theme-dark"))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => obs.disconnect()
  }, [])

  // Globe + animation loop + arc reveal + labels (unified effect)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    widthRef.current = canvas.offsetWidth

    const onResize = () => {
      if (canvasRef.current) widthRef.current = canvasRef.current.offsetWidth
    }
    window.addEventListener("resize", onResize)

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      scaleRef.current = Math.max(
        0.8,
        Math.min(3, scaleRef.current - e.deltaY * 0.001)
      )
    }
    canvas.addEventListener("wheel", onWheel, { passive: false })

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: widthRef.current,
      height: GLOBE_HEIGHT,
      phi: phiRef.current,
      theta: INITIAL_THETA,
      dark: isDark ? 1 : 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: isDark ? 6 : 1.5,
      baseColor: isDark ? [0.3, 0.3, 0.3] : [1, 1, 1],
      markerColor: [0.29, 0.68, 0.5],
      glowColor: isDark ? [0.15, 0.15, 0.15] : [1, 1, 1],
      markers: markers.map(({ location, size, id }) => ({
        location,
        size,
        id,
      })),
      arcs: [],
      arcColor: [0.46, 0.07, 0.65],
      arcWidth: 0.4,
      arcHeight: 0.3,
      opacity: prefersReducedMotion ? 1 : 0,
    })

    // Labels + photo popups (require CSS anchor positioning)
    const labelEls: HTMLElement[] = []
    const popupOuters: HTMLElement[] = []
    const timers: number[] = []
    const supportsAnchor = CSS.supports?.("position-anchor: --x") ?? false
    const wrapper = canvas.parentElement

    if (supportsAnchor && wrapper) {
      // Airport code labels
      for (const m of markers) {
        const el = document.createElement("span")
        el.className = styles.label
        el.textContent = m.id
        el.style.cssText = anchorCss(m.id)
        el.addEventListener("mouseenter", () => setHoveredMarker(m))
        el.addEventListener("mouseleave", () => setHoveredMarker(null))
        wrapper.appendChild(el)
        labelEls.push(el)
      }

      // Photo popups
      if (imagesByCountry) {
        const countriesWithImages = Object.keys(imagesByCountry) as CountryCode[]
        if (countriesWithImages.length > 0) {
          const activePopupCountries = new Set<string>()

          const addPopup = () => {
            if (activePopupCountries.size >= 2) return
            const available = countriesWithImages.filter(
              (c) => !activePopupCountries.has(c)
            )
            if (available.length === 0) return
            const code =
              available[Math.floor(Math.random() * available.length)]
            const imgs = imagesByCountry[code]!
            const imgIndex = Math.floor(Math.random() * imgs.length)
            const img = imgs[imgIndex]
            const countryMarkers = markers.filter(
              (m) => m.countryCode === code
            )
            if (countryMarkers.length === 0) return
            const marker =
              countryMarkers[
                Math.floor(Math.random() * countryMarkers.length)
              ]

            activePopupCountries.add(code)

            const outer = document.createElement("div")
            outer.style.cssText = anchorCss(marker.id, [
              "transition: opacity 0.6s ease",
              "z-index: 0",
            ])

            const popup = document.createElement("div")
            popup.className = styles.photoPopup

            const imgEl = document.createElement("img")
            imgEl.src = img.src
            imgEl.alt = `${marker.countryName} travel`
            imgEl.className = styles.photoPopupImg
            popup.appendChild(imgEl)

            const badge = document.createElement("span")
            badge.className = styles.photoPopupBadge
            badge.textContent = marker.flag
            popup.appendChild(badge)

            outer.addEventListener("mouseenter", () => {
              outer.style.zIndex = "3"
              labelEls.forEach((l) => (l.style.opacity = "0.2"))
            })
            outer.addEventListener("mouseleave", () => {
              outer.style.zIndex = "0"
              markers.forEach((m, i) => {
                if (labelEls[i])
                  labelEls[i].style.opacity = `var(--cobe-visible-${m.id}, 0)`
              })
            })

            popup.addEventListener("click", () => {
              document.dispatchEvent(
                new CustomEvent("travel:open-gallery", {
                  detail: { countryCode: code, imageIndex: imgIndex },
                })
              )
            })

            outer.appendChild(popup)
            wrapper.appendChild(outer)
            popupOuters.push(outer)

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                popup.classList.add(styles.photoPopupVisible)
              })
            })

            const removeTimer = window.setTimeout(() => {
              popup.classList.remove(styles.photoPopupVisible)
              activePopupCountries.delete(code)
              const fadeTimer = window.setTimeout(() => outer.remove(), 700)
              timers.push(fadeTimer)
            }, 8000)
            timers.push(removeTimer)
          }

          const staggerTimer = window.setTimeout(() => {
            addPopup()
            const intervalTimer = window.setInterval(addPopup, 3000)
            timers.push(intervalTimer)
          }, 5000)
          timers.push(staggerTimer)
        }
      }
    }

    // Arc animation
    let currentArcIndex = 0
    let arcProgress = 0
    let arcPauseCounter = 0
    const completedArcs: Array<{ from: [number, number]; to: [number, number] }> =
      []
    let cachedArcs: typeof completedArcs = []
    let arcsDirty = false

    // Main animation loop
    let fadeIn = prefersReducedMotion ? 1 : 0
    let running = true
    const animate = () => {
      if (!running) return
      if (fadeIn < 1) fadeIn = Math.min(1, fadeIn + 0.02)

      const theta = Math.max(
        -1.2,
        Math.min(1.2, INITIAL_THETA + movementY.current / 200)
      )

      // Grow arcs one at a time with pause between
      const updatePayload: Record<string, unknown> = {
        phi: phiRef.current + movementX.current / 200,
        theta,
        scale: scaleRef.current,
        markerElevation: 0.02 / scaleRef.current,
        width: widthRef.current,
        height: GLOBE_HEIGHT,
        opacity: fadeIn,
      }

      if (currentArcIndex < arcs.length) {
        if (arcPauseCounter > 0) {
          arcPauseCounter--
        } else {
          if (arcProgress === 0) {
            const arc = arcs[currentArcIndex]
            setCompletedFlights((prev) => [
              ...prev,
              { from: arc.fromCode, to: arc.toCode },
            ])
          }
          arcProgress = Math.min(1, arcProgress + ARC_GROW_SPEED)
          if (arcProgress >= 1) {
            completedArcs.push(arcs[currentArcIndex])
            cachedArcs = completedArcs.slice()
            currentArcIndex++
            arcProgress = 0
            arcPauseCounter = ARC_PAUSE_FRAMES
          }
        }
        arcsDirty = true
      }

      if (arcsDirty) {
        const visibleArcs =
          currentArcIndex < arcs.length && arcProgress > 0
            ? [
                ...cachedArcs,
                {
                  from: arcs[currentArcIndex].from,
                  to: interpolateGreatCircle(
                    arcs[currentArcIndex].from,
                    arcs[currentArcIndex].to,
                    arcProgress
                  ),
                },
              ]
            : cachedArcs
        updatePayload.arcs = visibleArcs
        if (currentArcIndex >= arcs.length) arcsDirty = false
      }

      globe.update(updatePayload)
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)

    return () => {
      running = false
      timers.forEach((t) => clearTimeout(t))
      popupOuters.forEach((el) => el.remove())
      labelEls.forEach((el) => el.remove())
      globe.destroy()
      // cobe wraps canvas in a div; unwrap to prevent nesting on re-creation
      const cobeWrapper = canvas.parentElement
      if (cobeWrapper && cobeWrapper !== containerRef.current) {
        cobeWrapper.replaceWith(canvas)
      }
      canvas.removeEventListener("wheel", onWheel)
      window.removeEventListener("resize", onResize)
    }
  }, [isDark, markers, arcs, imagesByCountry])

  return (
    <section className={styles.section} aria-label="Interactive travel globe">
      <div ref={containerRef} className={styles.container}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ touchAction: "none" }}
          onPointerDown={(e) => {
            pointerInteracting.current = e.clientX - movementX.current
            pointerInteractingY.current = e.clientY - movementY.current
            canvasRef.current?.setPointerCapture(e.pointerId)
            if (canvasRef.current)
              canvasRef.current.style.cursor = "grabbing"
          }}
          onPointerUp={(e) => {
            pointerInteracting.current = null
            canvasRef.current?.releasePointerCapture(e.pointerId)
            if (canvasRef.current)
              canvasRef.current.style.cursor = "grab"
          }}
          onPointerOut={() => {
            pointerInteracting.current = null
            if (canvasRef.current)
              canvasRef.current.style.cursor = "grab"
          }}
          onPointerMove={(e) => {
            if (pointerInteracting.current !== null) {
              movementX.current = e.clientX - pointerInteracting.current
              movementY.current = e.clientY - pointerInteractingY.current
            }
          }}
        />
        {hoveredMarker && (
          <div className={styles.tooltip}>
            <div className={styles.tooltipHeader}>
              <span className={styles.tooltipFlag}>{hoveredMarker.flag}</span>
              <span className={styles.tooltipCode}>{hoveredMarker.id}</span>
            </div>
            <div className={styles.tooltipName}>{hoveredMarker.fullName}</div>
            <div className={styles.tooltipCountry}>
              {hoveredMarker.countryName}
            </div>
            <div className={styles.tooltipYears}>
              {joinerWithAnd(hoveredMarker.years)}
            </div>
          </div>
        )}
        {completedFlights.length > 0 && (
          <div className={styles.flightTicker}>
            {completedFlights.map((f, i) => (
              <span key={i} className={styles.flightTag}>
                {f.from} → {f.to}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className={styles.disclaimer}>
        Some domestic flights in Brazil omitted for simplicity.
      </div>
    </section>
  )
}
