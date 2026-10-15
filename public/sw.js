/* WA-SHOP service worker — conservative, network-first.
 * Goal: make the app installable (PWA / Play Store TWA) without ever serving
 * stale or broken content. We try the network first and only fall back to a
 * cached copy when offline. API calls are never cached. */
const CACHE = 'wa-shop-v1';
const PRECACHE = ['/', '/dashboard', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/offline.html'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Never cache API / WhatsApp / cross-origin or SSE — always live.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/wa') || req.headers.get('accept') === 'text/event-stream') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || (req.mode === 'navigate' ? caches.match('/offline.html') : undefined))
      )
  );
});
