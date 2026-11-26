import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSocietyAppPath } from "./society-nav-events.ts";

describe("isSocietyAppPath", () => {
  it("detects society workspace routes and skips create", () => {
    assert.equal(isSocietyAppPath("/societies/abc"), true);
    assert.equal(isSocietyAppPath("/societies/abc/billing"), true);
    assert.equal(isSocietyAppPath("/societies/new"), false);
    assert.equal(isSocietyAppPath("/societies"), false);
    assert.equal(isSocietyAppPath("/profile"), false);
  });
});
