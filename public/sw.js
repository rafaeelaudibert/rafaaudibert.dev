// This website was previously using Gatsby, and they had a service worker that would cache the pages.
// This is messing up the new Astro version because it's still loading the old service worker and the old (white) pages.
// This service worker is here to remove the old cache pages and make the new pages load.
// This file is NOT loaded by our Astro site, it's just here to remove the old cache pages when the user has a cached version of the site via Gatsby.

self.addEventListener("activate", (event) =>
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            )
        )
    )
)
