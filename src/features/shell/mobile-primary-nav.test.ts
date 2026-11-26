import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isMobilePrimaryTab,
  mobileMoreNav,
  mobilePrimaryTabs,
} from "./mobile-primary-nav.ts";

describe("mobile primary nav", () => {
  it("keeps the same primary tabs for residents and admins", () => {
    assert.deepEqual(mobilePrimaryTabs(false), [
      "overview",
      "notices",
      "visitors",
      "billing",
    ]);
    assert.deepEqual(mobilePrimaryTabs(true), [
      "overview",
      "notices",
      "visitors",
      "billing",
    ]);
  });

  it("puts secondary modules behind More", () => {
    const residentMore = mobileMoreNav(false).map((item) => item.key);
    assert.deepEqual(residentMore, ["household", "complaints", "services"]);
    assert.ok(isMobilePrimaryTab("overview"));
    assert.equal(isMobilePrimaryTab("complaints"), false);

    const adminMore = mobileMoreNav(true).map((item) => item.key);
    assert.ok(adminMore.includes("buildings"));
    assert.ok(adminMore.includes("members"));
    assert.ok(!adminMore.includes("billing"));
  });

  it("respects household visibility", () => {
    const keys = mobileMoreNav(false, { includeHousehold: false }).map(
      (item) => item.key,
    );
    assert.equal(keys.includes("household"), false);
  });
});
