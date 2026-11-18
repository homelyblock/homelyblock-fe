import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isPublicPath } from "./public-paths.ts";

describe("isPublicPath", () => {
  it("allows the marketing site and auth recovery", () => {
    for (const path of [
      "/",
      "/about",
      "/features",
      "/how-it-works",
      "/contact",
      "/faq",
      "/help",
      "/security",
      "/sign-in",
      "/admin/sign-in",
      "/sign-up",
      "/password-reset",
      "/privacy",
      "/privacy-policy",
      "/terms",
      "/cookies",
      "/acceptable-use",
      "/accessibility",
      "/session-expired",
      "/unavailable",
      "/auth/callback",
      "/auth/update-password",
    ]) {
      assert.equal(isPublicPath(path), true, path);
    }
  });

  it("protects application routes", () => {
    assert.equal(isPublicPath("/onboarding"), false);
    assert.equal(isPublicPath("/onboarding/pending"), false);
    assert.equal(isPublicPath("/societies"), false);
    assert.equal(isPublicPath("/profile"), false);
    assert.equal(isPublicPath("/societies/abc/billing"), false);
    assert.equal(isPublicPath("/forbidden"), false);
  });
});
