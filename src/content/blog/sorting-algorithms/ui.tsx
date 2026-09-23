import React, { useEffect, useMemo, useState } from "react"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import styles from "./ui.module.css"

type Mode = "light" | "dark"

const readMode = (): Mode =>
  document.documentElement.classList.contains("theme-dark") ? "dark" : "light"

/** Follows the site's theme toggle, which flips `theme-dark` on <html>. */
export const useSiteTheme = (): Mode => {
  const [mode, setMode] = useState<Mode>(() =>
    typeof document === "undefined" ? "light" : readMode()
  )

  useEffect(() => {
    const observer = new MutationObserver(() => setMode(readMode()))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [])

  return mode
}

// Mirrors the gray and accent tokens in src/styles/global.css. MUI needs real
// color values, not CSS variables, for some of its computed styles.
const PALETTES = {
  light: {
    text: "#3d4663",
    muted: "#6474a2",
    divider: "#e3e6ee",
    paper: "#ffffff",
    accent: "#7611a6",
    bar: "#b9c6ea",
    // Bounds in the complexity charts: lower, function, upper
    bounds: ["#3b6fd8", "#7611a6", "#d98a00"],
    series: ["#7611a6", "#3b6fd8", "#0f9d8a", "#d98a00", "#d6456b", "#5b6478"],
    // Lighter partners for series[0..2], for the top half of stacked bars
    tints: ["#cfa3e3", "#a9c0ef", "#93d6cc"],
  },
  dark: {
    text: "#c3cadb",
    muted: "#8490b5",
    divider: "#283044",
    paper: "#141925",
    accent: "#c561f6",
    bar: "#34497d",
    bounds: ["#7aa2ff", "#c561f6", "#f5b83d"],
    series: ["#c561f6", "#7aa2ff", "#3cc9b3", "#f5b83d", "#f0708f", "#a3acc8"],
    tints: ["#6e3a8a", "#3b5288", "#1f6d62"],
  },
} as const

export const usePalette = () => PALETTES[useSiteTheme()]

export const ChartFigure = ({
  title,
  controls,
  children,
}: {
  title: string
  controls?: React.ReactNode
  children: React.ReactNode
}) => {
  const mode = useSiteTheme()
  const palette = PALETTES[mode]
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          text: { primary: palette.text, secondary: palette.muted },
          divider: palette.divider,
          background: { paper: palette.paper, default: palette.paper },
        },
        typography: { fontFamily: '"Public Sans", system-ui, sans-serif' },
      }),
    [mode, palette]
  )

  return (
    <ThemeProvider theme={theme}>
      <figure className={styles.figure}>
        <figcaption className={styles.head}>
          <span className={styles.title}>{title}</span>
          {controls && <div className={styles.controls}>{controls}</div>}
        </figcaption>
        <div className={styles.chart}>{children}</div>
      </figure>
    </ThemeProvider>
  )
}

/** A row of mutually exclusive toggle buttons, e.g. Linear | Log. */
export const Segmented = <T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly (readonly [T, string])[]
  value: T
  onChange: (value: T) => void
}) => (
  <div role="group" aria-label={label} className={styles.segmented}>
    <span className={styles.segmentedLabel} aria-hidden="true">
      {label}
    </span>
    <div className={styles.segments}>
      {options.map(([option, text]) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {text}
        </button>
      ))}
    </div>
  </div>
)
