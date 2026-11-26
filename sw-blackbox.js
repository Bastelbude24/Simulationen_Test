// Offline-Funktion für „Die Blackbox öffnen“ (foeXlab, 26.11.2026).
// Gilt nur für die Seite, die ihn registriert (scope = diese HTML-Datei). Strategie: erst Netz (damit
// Aktualisierungen ankommen), ohne Netz die zuletzt geladene Fassung aus dem Zwischenspeicher.
const CACHE = 'foexlab-blackbox-offline-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add(new Request(self.registration.scope, { cache: 'reload' }))).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('foexlab-blackbox-offline-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r.mode === 'navigate' ? self.registration.scope : r, copy)); }
      return res;
    }).catch(() => caches.match(r.mode === 'navigate' ? self.registration.scope : r, { ignoreSearch: true }))
  );
});
