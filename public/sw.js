/* HomelyBlock service worker — static assets only; never cache private data.
 * Keep CACHE_VERSION and rules in sync with src/features/pwa/cache-policy.ts
 */
const CACHE_VERSION = "v1";
const STATIC_CACHE = `hb-static-${CACHE_VERSION}`;
const CACHE_PREFIX = "hb-static-";

const PRECACHE_URLS = [
  "/offline.html",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

const SAFE_STATIC_PREFIXES = ["/_next/static/", "/icons/"];
const SAFE_STATIC_EXACT = new Set([
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/favicon-16.png",
  "/icons/favicon-32.png",
]);

const NEVER_CACHE_HOST_SUFFIXES = ["supabase.co", "supabase.in"];
const NEVER_CACHE_PATH_PREFIXES = ["/api/", "/auth/"];
const SENSITIVE_QUERY_KEYS = [
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "code",
  "state",
  "session",
  "auth",
  "password",
  "apikey",
  "api_key",
  "authorization",
  "authorization_code",
];

const SAFE_CONTENT_TYPE_PREFIXES = [
  "text/css",
  "text/javascript",
  "application/javascript",
  "application/manifest+json",
  "application/json",
  "image/",
  "font/",
  "application/font-",
  "application/x-font-",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await Promise.all(
          PRECACHE_URLS.map(async (path) => {
            try {
              const response = await fetch(path, { cache: "reload" });
              const url = new URL(path, self.location.origin);
              if (isCacheableStaticResponse(response, url)) {
                await cache.put(path, response);
              }
            } catch {
              // Precache is best-effort; registration must not fail the app.
            }
          }),
        );
      } catch {
        // Opening the cache failed — leave install successful so the worker can still
        // serve network-only behaviour.
      }
      // Do not skipWaiting here — wait for an explicit user "Update" action.
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== STATIC_CACHE)
            .map((key) => caches.delete(key)),
        );
      } catch {
        // Cleanup is best-effort.
      }
      // Claim so SKIP_WAITING + Update can take control; the page only reloads when
      // the user explicitly requested an update in the app UI.
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function hostMatchesSuffix(hostname, suffix) {
  const host = hostname.toLowerCase();
  return host === suffix || host.endsWith(`.${suffix}`);
}

function hasSensitiveQuery(url) {
  for (const key of url.searchParams.keys()) {
    const normalized = key.toLowerCase();
    if (
      SENSITIVE_QUERY_KEYS.some(
        (sensitive) => normalized === sensitive || normalized.endsWith(`_${sensitive}`),
      )
    ) {
      return true;
    }
  }
  return false;
}

function mustNeverCache(request, url) {
  if (request.method !== "GET") return true;
  if (request.headers.has("Authorization") || request.headers.has("authorization")) {
    return true;
  }
  if (hasSensitiveQuery(url)) return true;
  if (NEVER_CACHE_HOST_SUFFIXES.some((suffix) => hostMatchesSuffix(url.hostname, suffix))) {
    return true;
  }
  if (NEVER_CACHE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return true;
  }
  if (url.pathname.includes("/api/v1/")) return true;
  return false;
}

function isSafeStatic(url) {
  if (url.origin !== self.location.origin) return false;
  if (hasSensitiveQuery(url)) return false;
  if (SAFE_STATIC_EXACT.has(url.pathname)) return true;
  return SAFE_STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

function isDocumentNavigation(request) {
  // Top-level navigations only. Do not use Accept: text/html — RSC/XHR often include it.
  return request.mode === "navigate" || request.destination === "document";
}

function contentTypeBase(response) {
  const raw = response.headers.get("Content-Type") || response.headers.get("content-type") || "";
  return raw.toLowerCase().split(";")[0].trim();
}

function isCacheableStaticResponse(response, url) {
  if (!response.ok) return false;
  if (response.status < 200 || response.status >= 300) return false;
  if (response.type !== "basic") return false;
  if (response.redirected) return false;
  if (response.headers.get("Set-Cookie") || response.headers.get("set-cookie")) return false;
  if (!isSafeStatic(url)) return false;

  const contentType = contentTypeBase(response);
  if (!contentType) {
    return url.pathname.startsWith("/_next/static/");
  }
  if (url.pathname === "/offline.html") return contentType === "text/html";
  if (url.pathname === "/manifest.webmanifest") {
    return (
      contentType === "application/manifest+json" ||
      contentType === "application/json" ||
      contentType === "text/json"
    );
  }
  if (url.pathname.startsWith("/icons/") || url.pathname === "/favicon.ico") {
    return contentType.startsWith("image/");
  }
  return SAFE_CONTENT_TYPE_PREFIXES.some(
    (prefix) => contentType === prefix || contentType.startsWith(prefix),
  );
}

async function putInCache(cache, request, response) {
  try {
    await cache.put(request, response);
  } catch {
    // Quota or Cache API failure must not break the network response.
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  // Cross-origin: never intercept for caching. Let the browser handle natively.
  if (url.origin !== self.location.origin) return;

  if (mustNeverCache(request, url)) {
    return;
  }

  // Document navigations: network only; offline fallback is the public offline page only.
  if (isDocumentNavigation(request)) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          try {
            const cached = await caches.match("/offline.html", { cacheName: STATIC_CACHE });
            if (cached) return cached;
          } catch {
            // ignore cache read failures
          }
          return new Response(
            "<!doctype html><title>Offline</title><p>HomelyBlock needs an internet connection.</p>",
            { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
          );
        }
      })(),
    );
    return;
  }

  // Same-origin allowlisted static assets only: cache-first.
  if (isSafeStatic(url)) {
    event.respondWith(
      (async () => {
        let cache = null;
        try {
          cache = await caches.open(STATIC_CACHE);
        } catch {
          // Fall through to network if Cache API is unavailable.
        }

        if (cache) {
          try {
            const cached = await cache.match(request);
            if (cached) return cached;
          } catch {
            // ignore match failures
          }
        }

        const response = await fetch(request);
        if (cache && isCacheableStaticResponse(response, url)) {
          await putInCache(cache, request, response.clone());
        }
        return response;
      })(),
    );
  }

  // Everything else (RSC payloads, HTML fragments): network only — do not intercept.
});
