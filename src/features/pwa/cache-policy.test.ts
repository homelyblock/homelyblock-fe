import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasSensitiveQuery,
  isCacheableStaticResponse,
  isDocumentNavigation,
  isHomelyBlockCacheName,
  isSafeStaticUrl,
  mustNeverCache,
  staticCacheName,
} from "./cache-policy.ts";

const ORIGIN = "https://app.homelyblock.example";

function headers(init: Record<string, string> = {}) {
  return new Headers(init);
}

describe("PWA cache policy", () => {
  it("names versioned static caches and only HomelyBlock cache names", () => {
    assert.equal(staticCacheName("v1"), "hb-static-v1");
    assert.equal(staticCacheName("v2"), "hb-static-v2");
    assert.equal(isHomelyBlockCacheName("hb-static-v1"), true);
    assert.equal(isHomelyBlockCacheName("workbox-precache"), false);
    assert.equal(isHomelyBlockCacheName("other"), false);
  });

  it("allows only same-origin allowlisted static asset paths", () => {
    assert.equal(isSafeStaticUrl(new URL("/_next/static/chunk.js", ORIGIN), ORIGIN), true);
    assert.equal(isSafeStaticUrl(new URL("/icons/icon-192.png", ORIGIN), ORIGIN), true);
    assert.equal(isSafeStaticUrl(new URL("/offline.html", ORIGIN), ORIGIN), true);
    assert.equal(isSafeStaticUrl(new URL("/manifest.webmanifest", ORIGIN), ORIGIN), true);
    assert.equal(isSafeStaticUrl(new URL("/societies", ORIGIN), ORIGIN), false);
    assert.equal(isSafeStaticUrl(new URL("/profile", ORIGIN), ORIGIN), false);
    assert.equal(isSafeStaticUrl(new URL("/billing", ORIGIN), ORIGIN), false);
    assert.equal(
      isSafeStaticUrl(new URL("https://cdn.example/_next/static/x.js"), ORIGIN),
      false,
    );
  });

  it("never caches API, auth, Supabase, cross-path API, or authorized requests", () => {
    assert.equal(
      mustNeverCache(new URL("https://api.example/api/v1/societies"), { method: "GET" }),
      true,
    );
    assert.equal(mustNeverCache(new URL(`${ORIGIN}/api/health`), { method: "GET" }), true);
    assert.equal(mustNeverCache(new URL(`${ORIGIN}/auth/callback`), { method: "GET" }), true);
    assert.equal(
      mustNeverCache(new URL("https://xyz.supabase.co/auth/v1/user"), { method: "GET" }),
      true,
    );
    assert.equal(
      mustNeverCache(new URL(`${ORIGIN}/icons/icon-192.png`), {
        method: "GET",
        headers: headers({ Authorization: "Bearer secret" }),
      }),
      true,
    );
    assert.equal(mustNeverCache(new URL(`${ORIGIN}/icons/icon-192.png`), { method: "POST" }), true);
    assert.equal(mustNeverCache(new URL(`${ORIGIN}/icons/icon-192.png`), { method: "HEAD" }), true);
    assert.equal(mustNeverCache(new URL(`${ORIGIN}/icons/icon-192.png`), { method: "GET" }), false);
  });

  it("never caches URLs with sensitive query parameters", () => {
    assert.equal(hasSensitiveQuery(new URL(`${ORIGIN}/icons/x.png?access_token=abc`)), true);
    assert.equal(hasSensitiveQuery(new URL(`${ORIGIN}/_next/static/a.js?code=1`)), true);
    assert.equal(hasSensitiveQuery(new URL(`${ORIGIN}/icons/x.png?v=3`)), false);
    assert.equal(
      mustNeverCache(new URL(`${ORIGIN}/icons/icon-192.png?token=secret`), { method: "GET" }),
      true,
    );
    assert.equal(
      isSafeStaticUrl(new URL(`${ORIGIN}/icons/icon-192.png?refresh_token=x`), ORIGIN),
      false,
    );
  });

  it("treats only top-level navigations as document navigations", () => {
    assert.equal(isDocumentNavigation({ mode: "navigate" }), true);
    assert.equal(isDocumentNavigation({ destination: "document" }), true);
    assert.equal(
      isDocumentNavigation({
        mode: "cors",
        destination: "empty",
      }),
      false,
    );
    // RSC/XHR often advertise text/html in Accept — that alone must not qualify.
    assert.equal(isDocumentNavigation({ mode: "cors", destination: "script" }), false);
  });

  it("only caches successful same-origin basic responses with safe content types", () => {
    const iconUrl = new URL("/icons/icon-192.png", ORIGIN);
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "basic",
          redirected: false,
          headers: headers({ "Content-Type": "image/png" }),
        },
        iconUrl,
        ORIGIN,
      ),
      true,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "opaque",
          headers: headers({ "Content-Type": "image/png" }),
        },
        iconUrl,
        ORIGIN,
      ),
      false,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: false,
          status: 404,
          type: "basic",
          headers: headers({ "Content-Type": "image/png" }),
        },
        iconUrl,
        ORIGIN,
      ),
      false,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "basic",
          redirected: true,
          headers: headers({ "Content-Type": "image/png" }),
        },
        iconUrl,
        ORIGIN,
      ),
      false,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "basic",
          headers: headers({ "Content-Type": "image/png", "Set-Cookie": "sid=1" }),
        },
        iconUrl,
        ORIGIN,
      ),
      false,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "basic",
          headers: headers({ "Content-Type": "application/json" }),
        },
        iconUrl,
        ORIGIN,
      ),
      false,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "basic",
          headers: headers({ "Content-Type": "application/javascript" }),
        },
        new URL("/_next/static/chunks/app.js", ORIGIN),
        ORIGIN,
      ),
      true,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "basic",
          headers: headers({ "Content-Type": "text/html" }),
        },
        new URL("/societies", ORIGIN),
        ORIGIN,
      ),
      false,
    );
    assert.equal(
      isCacheableStaticResponse(
        {
          ok: true,
          status: 200,
          type: "basic",
          headers: headers({ "Content-Type": "text/html; charset=utf-8" }),
        },
        new URL("/offline.html", ORIGIN),
        ORIGIN,
      ),
      true,
    );
  });
});
