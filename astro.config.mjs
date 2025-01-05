// @ts-check
import { defineConfig, envField } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import dsv from '@rollup/plugin-dsv'

import react from '@astrojs/react';

export default defineConfig({
  site: 'https://rafaaudibert.dev',
  prefetch: {
    prefetchAll: true, // On hover, prefetch that link
  },
  experimental: {
    clientPrerender: true, // Prerender pages on the client when prefetching it
  },
  markdown: {
    remarkPlugins: [remarkMath], // Detect math equations in markdown
    rehypePlugins: [rehypeKatex], // Render latex equations in markdown
  },
  env: {
    schema: {
      POSTHOG_API_KEY: envField.string({ context: "client", access: "public", startsWith: "phc_" }),
      POSTHOG_API_HOST: envField.string({ context: "client", access: "public", startsWith: "https://" }),
      AMAZON_SORTING_TABLE_API_URL: envField.string({ context: "client", access: "public", startsWith: "https://", includes: "amazonaws.com" }),
    },
  },
  vite: {
    plugins: [dsv()],
  },
  integrations: [
    // React and MDX for content
    react(),
    mdx(),

    // Build a sitemap to help with SEO
    sitemap(),
  ]
})