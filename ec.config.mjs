// @ts-check
import { defineEcConfig } from "astro-expressive-code"

// Expressive Code options live here rather than in astro.config.mjs because
// the `<Code>` component (used on /mcp) needs to read them at render time,
// and a function option such as themeCssSelector can't be serialised through
// the Astro config.
export default defineEcConfig({
  themes: ["catppuccin-latte", "catppuccin-mocha"],
  // The site toggles dark mode with a class on <html>, not the media query
  themeCssSelector: (theme) =>
    theme.type === "dark" ? ".theme-dark" : ":root:not(.theme-dark)",
  useDarkModeMediaQuery: false,
  styleOverrides: {
    borderRadius: "0.625rem",
    borderColor: "var(--gray-800)",
    codeFontFamily: "var(--font-mono)",
    codeFontSize: "0.8125rem",
    codeLineHeight: "1.65",
    uiFontFamily: "var(--font-body)",
    uiFontSize: "0.8125rem",
    frames: {
      shadowColor: "transparent",
      editorActiveTabIndicatorTopColor: "var(--accent-regular)",
    },
  },
})
