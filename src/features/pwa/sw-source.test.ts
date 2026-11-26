import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { DEFAULT_CACHE_VERSION, STATIC_CACHE_PREFIX } from "./cache-policy.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const sw = readFileSync(join(ROOT, "public/sw.js"), "utf8");

describe("service worker source hardening", () => {
  it("keeps cache version aligned with cache-policy", () => {
    assert.match(sw, new RegExp(`CACHE_VERSION = "${DEFAULT_CACHE_VERSION}"`));
    assert.match(sw, new RegExp(STATIC_CACHE_PREFIX));
  });

  it("only skipWaits after an explicit client message", () => {
    assert.match(sw, /Do not skipWaiting here/);
    assert.match(sw, /data\.type === "SKIP_WAITING"/);
    const installBlock = sw.slice(
      sw.indexOf('addEventListener("install"'),
      sw.indexOf('addEventListener("activate"'),
    );
    assert.equal(installBlock.includes("skipWaiting("), false);
  });

  it("only deletes HomelyBlock-owned caches", () => {
    assert.match(sw, /key\.startsWith\(CACHE_PREFIX\)/);
  });

  it("rejects sensitive queries, Set-Cookie, redirects, and opaque responses", () => {
    assert.match(sw, /hasSensitiveQuery/);
    assert.match(sw, /Set-Cookie/);
    assert.match(sw, /response\.redirected/);
    assert.match(sw, /response\.type !== "basic"/);
    assert.match(sw, /putInCache/);
  });

  it("limits offline fallback to navigate/document modes", () => {
    assert.match(sw, /request\.mode === "navigate"/);
    assert.equal(sw.includes('accept.includes("text/html")'), false);
  });
});
