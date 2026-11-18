import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { societyNavKey, visibleSocietyNav } from "./nav-items.ts";

describe("societyNavKey", () => {
  const societyId = "soc-1";

  it("marks the society root as overview", () => {
    assert.equal(societyNavKey(`/societies/${societyId}`, societyId), "overview");
  });

  it("hides administrative modules from residents", () => {
    const resident = visibleSocietyNav(false).map((item) => item.key);
    assert.deepEqual(resident, [
      "overview",
      "household",
      "notices",
      "visitors",
      "billing",
      "complaints",
      "services",
    ]);
    const admin = visibleSocietyNav(true).map((item) => item.key);
    assert.ok(admin.includes("buildings"));
    assert.ok(admin.includes("members"));
    assert.ok(admin.includes("residents"));
  });

  it("hides household when the caller has no active membership", () => {
    const keys = visibleSocietyNav(true, { includeHousehold: false }).map(
      (item) => item.key,
    );
    assert.equal(keys.includes("household"), false);
    assert.ok(keys.includes("overview"));
  });

  it("marks nested module routes", () => {
    assert.equal(
      societyNavKey(`/societies/${societyId}/billing/bills/b1`, societyId),
      "billing",
    );
    assert.equal(
      societyNavKey(`/societies/${societyId}/notices/new`, societyId),
      "notices",
    );
  });
});
