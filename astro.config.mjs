// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';

// https://astro.build/config
export default defineConfig({
  site: 'https://rafaaudibert.dev',
  prefetch: {
    prefetchAll: true, // On hover, prefetch that link
  },
  experimental: {
    clientPrerender: true, // Prerender pages on the client when prefetching it
  },
  integrations: [
    sitemap(),

    // Compressor needs to be the last integration to compress all generated files
    compressor(),
  ]
});