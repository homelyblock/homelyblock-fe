/**
 * Shared rules for what the HomelyBlock service worker may cache.
 * Kept in TypeScript so tests can assert exclusions without parsing sw.js.
 * Keep public/sw.js in sync with these rules.
 */

/** Versioned static-asset cache name prefix. Bump CACHE_VERSION in sw.js together. */
export const STATIC_CACHE_PREFIX = "hb-static-";

export const DEFAULT_CACHE_VERSION = "v1";

export function staticCacheName(version = DEFAULT_CACHE_VERSION): string {
  return `${STATIC_CACHE_PREFIX}${version}`;
}

/** Same-origin paths that are safe to precache / cache-first. */
export const SAFE_STATIC_PATH_PREFIXES = [
  "/_next/static/",
  "/icons/",
] as const;

export const SAFE_STATIC_EXACT_PATHS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
] as const;

/**
 * Host/path patterns that must never be stored by the service worker.
 * Covers HomelyBlock API traffic, Supabase Auth, and any Authorization-bearing request.
 */
export const NEVER_CACHE_HOST_SUFFIXES = [
  "supabase.co",
  "supabase.in",
] as const;

export const NEVER_CACHE_PATH_PREFIXES = [
  "/api/",
  "/auth/",
] as const;

/** Query keys that indicate auth/session material — never cache these URLs. */
export const SENSITIVE_QUERY_KEYS = [
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
] as const;

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
] as const;

export function isHomelyBlockCacheName(name: string): boolean {
  return name.startsWith(STATIC_CACHE_PREFIX);
}

export function isSafeStaticUrl(url: URL, appOrigin: string): boolean {
  if (url.origin !== appOrigin) return false;
  if (hasSensitiveQuery(url)) return false;
  if (SAFE_STATIC_EXACT_PATHS.includes(url.pathname as (typeof SAFE_STATIC_EXACT_PATHS)[number])) {
    return true;
  }
  return SAFE_STATIC_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

export function hasSensitiveQuery(url: URL): boolean {
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

export function mustNeverCache(url: URL, request: { method: string; headers?: Headers }): boolean {
  if (request.method !== "GET") return true;
  if (request.headers?.has("Authorization")) return true;
  if (request.headers?.has("authorization")) return true;
  if (hasSensitiveQuery(url)) return true;

  // Never store cross-origin responses in the app cache.
  // Callers that pass same-origin still apply path rules below.

  const host = url.hostname.toLowerCase();
  if (NEVER_CACHE_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
    return true;
  }

  if (NEVER_CACHE_PATH_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    return true;
  }

  // NestJS API is a separate origin; never cache cross-origin JSON.
  if (url.pathname.includes("/api/v1/")) return true;

  return false;
}

/**
 * Only top-level navigations get the offline HTML fallback.
 * Do not use Accept: text/html — many XHR/RSC requests include it as a fallback.
 */
export function isDocumentNavigation(request: {
  mode?: string;
  destination?: string;
}): boolean {
  return request.mode === "navigate" || request.destination === "document";
}

export function isCacheableStaticResponse(
  response: {
    ok: boolean;
    status: number;
    type: string;
    redirected?: boolean;
    headers: { get(name: string): string | null };
  },
  requestUrl: URL,
  appOrigin: string,
): boolean {
  if (!response.ok) return false;
  if (response.status < 200 || response.status >= 300) return false;
  if (response.type !== "basic") return false;
  if (response.redirected) return false;
  if (response.headers.get("Set-Cookie") || response.headers.get("set-cookie")) return false;
  if (!isSafeStaticUrl(requestUrl, appOrigin)) return false;

  const contentType = (response.headers.get("Content-Type") || response.headers.get("content-type") || "")
    .toLowerCase()
    .split(";")[0]
    ?.trim();

  if (!contentType) {
    // Hashed Next static assets sometimes omit Content-Type in tests; require type in browsers.
    return requestUrl.pathname.startsWith("/_next/static/");
  }

  if (requestUrl.pathname === "/offline.html") {
    return contentType === "text/html";
  }

  if (requestUrl.pathname === "/manifest.webmanifest") {
    return (
      contentType === "application/manifest+json" ||
      contentType === "application/json" ||
      contentType === "text/json"
    );
  }

  if (
    requestUrl.pathname.startsWith("/icons/") ||
    requestUrl.pathname === "/favicon.ico"
  ) {
    return contentType.startsWith("image/");
  }

  return SAFE_CONTENT_TYPE_PREFIXES.some(
    (prefix) => contentType === prefix || contentType.startsWith(prefix),
  );
}
