const CACHE_NAME = "yatraai-v1";
const SOS_CACHE = "yatraai-sos-v1";

// Routes to cache so SOS works offline.
const CACHED_ROUTES = ["/", "/scan", "/sos", "/manifest.json", "/emergency-pack.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SOS_CACHE);
      await cache.addAll(CACHED_ROUTES);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle same-origin GET requests.
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(SOS_CACHE);
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        if (res && res.status === 200) {
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        // Offline fallback for navigation.
        if (req.mode === "navigate") {
          const sos = await cache.match("/sos");
          if (sos) return sos;
        }
        return new Response("Offline", { status: 503 });
      };
    })()
  );
});