// @ts-check
import { defineConfig } from 'astro/config'

import compressor from 'astro-compressor'
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
  vite: {
    plugins: [dsv()],
  },
  integrations: [
    // React and MDX for content
    react(),
    mdx(),

    // Build a sitemap to help with SEO
    sitemap(),

    // Compressor needs to be the last integration to compress all generated files
    compressor(),
  ]
})