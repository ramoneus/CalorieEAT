// Offline support. The page itself is fetched network-first so every online visit gets the
// latest deploy; Vite's hashed assets never change, so they are served from the cache.
const CACHE = 'caloreat-v2'
const SHELL = ['./', 'manifest.webmanifest', 'favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png']

// The JS/CSS bundles a given index.html points to (their names change on every build).
const assetsIn = (html) => [...html.matchAll(/(?:src|href)="\.?\/?(assets\/[^"]+)"/g)].map((m) => m[1])

// Remembers which bundles the cached page uses, to tell when a new deploy has arrived.
const ENTRY_KEY = './__entry-assets'

async function cachePage(response) {
  const cache = await caches.open(CACHE)
  const html = await response.clone().text()
  const assets = assetsIn(html)
  const previous = await cache.match(ENTRY_KEY).then((r) => (r ? r.json() : []))
  await cache.put('./', response)
  await cache.addAll(assets)
  // On a new deploy, drop the old bundles. Lazily loaded files (the barcode scanner) aren't
  // listed in the page, so they're only cleared then and are fetched again when next needed.
  if (previous.join() !== assets.join()) {
    for (const req of await cache.keys()) {
      const path = new URL(req.url).pathname
      if (path.includes('/assets/') && !assets.some((a) => path.endsWith(a))) await cache.delete(req)
    }
    await cache.put(ENTRY_KEY, new Response(JSON.stringify(assets)))
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      await cache.addAll(SHELL.slice(1))
      await cachePage(await fetch('./', { cache: 'no-cache' }))
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) event.waitUntil(cachePage(response.clone()))
          return response
        })
        .catch(async () => (await caches.match('./')) ?? Response.error()),
    )
    return
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)))
          }
          return response
        }),
    ),
  )
})
