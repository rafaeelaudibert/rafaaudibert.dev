// @ts-check
import { defineConfig, envField } from 'astro/config'

import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import dsv from '@rollup/plugin-dsv'

import react from '@astrojs/react';

const URL = "https://rafaaudibert.dev"

export default defineConfig({
  // Guarantees that we can properly generate the sitemap
  site: URL,

  // On hover, prefetch that link
  prefetch: {
    prefetchAll: true,
  },

  // Prerender pages on the client when prefetching it
  experimental: {
    clientPrerender: true,
  },

  // Detect math equations in markdown
  markdown: {
    remarkPlugins: [remarkMath], // Detect math equations in markdown
    rehypePlugins: [rehypeKatex], // Render latex equations in markdown
  },

  // Typed environment variables to guarantee they always exist when building the site
  env: {
    schema: {
      POSTHOG_API_KEY: envField.string({ context: "client", access: "public", startsWith: "phc_" }),
      POSTHOG_API_HOST: envField.string({ context: "client", access: "public", startsWith: "https://" }),
      AMAZON_SORTING_TABLE_API_URL: envField.string({ context: "client", access: "public", startsWith: "https://", includes: "amazonaws.com" }),
    },
  },

  // Vite has some cool plugins that we can use, they can be exposed here
  vite: {
    plugins: [dsv()],
  },

  // Integrations are astro plugins
  integrations: [
    // React and MDX for content
    react(),
    mdx(),

    // Build a sitemap to help with SEO
    sitemap({
      customPages: [
        `${URL}/llms.txt`, // The plugin doesn't detect non-astro pages by default, so we need to add them manually here
      ],
    }),
  ]
})