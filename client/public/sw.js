const CACHE_VERSION = "zero-sum-pwa-v3";
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const APP_SHELL = ["/", "/manifest.json", "/sw.js"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => undefined)
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    const existing = clientList.find((client) => "focus" in client);
    if (existing) return existing.focus();
    return clients.openWindow("/");
  }));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => !key.startsWith(CACHE_VERSION))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

const isSameOrigin = (request) => new URL(request.url).origin === self.location.origin;
const isNavigation = (request) => request.mode === "navigate" || request.destination === "document";
const isCacheFirstResource = (request) => ["image", "audio", "font"].includes(request.destination);

async function cacheResponse(request, response) {
  if (!response || !response.ok || !isSameOrigin(request)) return response;
  // 206 Partial Content (audio/video Range requests) can't be stored via
  // Cache.put — attempting to do so throws and was breaking bgm playback.
  if (response.status === 206) return response;
  const cache = await caches.open(RUNTIME_CACHE);
  await cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    return (await caches.match(request)) || (await caches.match("/"));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || !isSameOrigin(request)) return;

  if (isNavigation(request)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCacheFirstResource(request)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // JavaScript, CSS, and manifest use network-first so new deployments arrive quickly;
  // cached responses keep the app alive when the connection disappears.
  event.respondWith(networkFirst(request));
});
