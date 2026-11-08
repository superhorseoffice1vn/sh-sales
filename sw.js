// SalesData service worker — lets the app open with no signal (data queue lives in the page).
const CACHE = 'salesdata-v3';
const FILES = ['./', './index.html', './manifest.json', './logo.png', './icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Network first (so updates show immediately), cache as fallback. Never touch API calls.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
              .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
