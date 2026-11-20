import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { safeAuthRedirectPath } from "./safe-redirect.ts";

describe("safeAuthRedirectPath", () => {
  it("allows relative in-app paths", () => {
    assert.equal(safeAuthRedirectPath("/societies"), "/societies");
    assert.equal(
      safeAuthRedirectPath("/societies/abc/notices"),
      "/societies/abc/notices",
    );
  });

  it("rejects open redirects", () => {
    assert.equal(safeAuthRedirectPath("https://evil.example"), "/societies");
    assert.equal(safeAuthRedirectPath("//evil.example"), "/societies");
    assert.equal(safeAuthRedirectPath("\\\\evil.example"), "/societies");
    assert.equal(safeAuthRedirectPath("http://localhost:3000/x"), "/societies");
  });

  it("does not send people back into auth screens", () => {
    assert.equal(safeAuthRedirectPath("/sign-in"), "/societies");
    assert.equal(safeAuthRedirectPath("/admin/sign-in"), "/societies");
    assert.equal(safeAuthRedirectPath("/sign-in?next=/profile"), "/societies");
    assert.equal(safeAuthRedirectPath("/session-expired"), "/societies");
    assert.equal(safeAuthRedirectPath("/auth/callback"), "/societies");
    assert.equal(
      safeAuthRedirectPath("/auth/update-password"),
      "/auth/update-password",
    );
  });

  it("falls back when missing", () => {
    assert.equal(safeAuthRedirectPath(null), "/societies");
    assert.equal(safeAuthRedirectPath(""), "/societies");
  });
});
