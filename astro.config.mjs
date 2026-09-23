// @ts-check
import { defineConfig, envField, fontProviders } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import dsv from '@rollup/plugin-dsv'

import react from '@astrojs/react';
import expressiveCode from 'astro-expressive-code';

import { site } from './src/data/site.ts';

export default defineConfig({
  // Guarantees that we can properly generate the sitemap
  site: site.url,

  // On hover, prefetch that link
  prefetch: {
    prefetchAll: true,
  },

  // Some experimental configuration
  experimental: {
    // Prerender pages on the client when prefetching it
    clientPrerender: true,
    // Improve intelisense for content files
    contentIntellisense: true
  },

  // Detect math equations in markdown.
  // Astro v7+ defaults to the native Sätteri processor, so we opt back into the
  // remark/rehype pipeline via `@astrojs/markdown-remark` to keep our plugins.
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath], // Detect math equations in markdown
      rehypePlugins: [rehypeKatex], // Render latex equations in markdown
    }),
  },

  // Fonts are downloaded at build time and served from this domain, with
  // metric-matched fallbacks to avoid layout shift while they load.
  // Roles: Rubik for headings, Literata for prose, Public Sans for interface
  // text, IBM Plex Mono for metadata and code. See AGENTS.md.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Rubik",
      cssVariable: "--font-rubik",
      weights: ["500 600"],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "Literata",
      cssVariable: "--font-literata",
      weights: ["400 600"],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["serif"],
      // Optical sizing: sturdier letterforms for body text, finer at display sizes
      options: { experimental: { variableAxis: { opsz: [["7", "72"]] } } },
    },
    {
      provider: fontProviders.google(),
      name: "Public Sans",
      cssVariable: "--font-public-sans",
      weights: ["400 700"],
      styles: ["normal", "italic"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-ibm-plex-mono",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin", "latin-ext"],
      fallbacks: ["monospace"],
    },
  ],

  // Image optimization settings
  image: {
    layout: "constrained",
  },

  // Typed environment variables to guarantee they always exist when building the site
  env: {
    schema: {
      POSTHOG_API_KEY: envField.string({ context: "client", access: "public", startsWith: "phc_" }),
      POSTHOG_API_HOST: envField.string({ context: "client", access: "public", startsWith: "https://" }),
    },
  },

  // Vite has some cool plugins that we can use, they can be exposed here
  vite: {
    plugins: [dsv()],
  },

  // Integrations are astro plugins
  integrations: [
    // Code blocks: syntax highlighting, frames, titles and copy buttons.
    // Must come before mdx() so it also handles code blocks inside MDX.
    expressiveCode({
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
    }),

    // React and MDX for content
    react(),
    mdx(),

    // Build a sitemap to help with SEO
    sitemap({
      customPages: [
        `${site.url}/llms.txt`, // The plugin doesn't detect non-astro pages by default, so we need to add them manually here
      ],
    }),
  ]
})