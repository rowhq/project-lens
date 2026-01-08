/**
 * TruPlat Service Worker
 * Push Notifications + Offline Support for Appraiser App
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `truplat-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `truplat-dynamic-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  "/appraiser/dashboard",
  "/appraiser/jobs",
  "/appraiser/earnings",
  "/appraiser/profile",
];

// API patterns to cache with stale-while-revalidate
const CACHEABLE_API_PATTERNS = [
  /\/api\/trpc\/appraiser\.profile\.get/,
  /\/api\/trpc\/job\.myJobs/,
  /\/api\/trpc\/job\.available/,
  /\/api\/trpc\/appraiser\.earnings/,
];

// ============================================
// INSTALL EVENT
// ============================================
self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching app shell");
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log("[SW] Some assets failed to cache:", err);
      });
    })
  );
  self.skipWaiting();
});

// ============================================
// ACTIVATE EVENT
// ============================================
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith("truplat-") &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE
            );
          })
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// ============================================
// FETCH EVENT - Offline Support
// ============================================
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  const url = new URL(request.url);
  if (!url.origin.includes(self.location.origin)) return;

  // API requests - Stale-while-revalidate for cacheable APIs
  if (url.pathname.startsWith("/api/trpc/")) {
    if (isCacheableAPI(url.href)) {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  // App pages - Network first, fallback to cache
  if (url.pathname.startsWith("/appraiser")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - Cache first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

/**
 * Cache-first strategy
 */
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    return new Response("Offline", { status: 503 });
  }
}

/**
 * Network-first strategy
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // Return a basic offline page HTML
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Offline - TruPlat</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui; background: #0A0A0A; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
            .container { text-align: center; padding: 2rem; }
            h1 { color: #4ADE80; }
            button { background: #4ADE80; color: #000; border: none; padding: 12px 24px; font-weight: 600; cursor: pointer; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      { status: 503, headers: { "Content-Type": "text/html" } }
    );
  }
}

/**
 * Stale-while-revalidate strategy for API calls
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // Return cached immediately if available, fetch in background
  return cached || fetchPromise;
}

/**
 * Check if API should be cached
 */
function isCacheableAPI(url) {
  return CACHEABLE_API_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Check if request is for static asset
 */
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf)$/i.test(pathname);
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let data = {
    title: "New Job Available",
    body: "A new appraisal job is available in your area.",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: { url: "/appraiser/jobs" },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error("[SW] Failed to parse push data:", e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: data.data || { url: "/appraiser/jobs" },
    actions: [
      { action: "view", title: "View Jobs" },
      { action: "dismiss", title: "Dismiss" },
    ],
    tag: "job-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/appraiser/jobs";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes("/appraiser") && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================
// BACKGROUND SYNC - Offline Uploads
// ============================================
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);
  if (event.tag === "sync-evidence") {
    event.waitUntil(syncPendingEvidence());
  }
});

async function syncPendingEvidence() {
  console.log("[SW] Syncing pending evidence...");
  // This would sync any queued evidence uploads from IndexedDB
  // Implementation depends on how offline uploads are queued
}

// ============================================
// MESSAGE HANDLING
// ============================================
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_CACHE") {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});

console.log("[SW] Service Worker loaded");
