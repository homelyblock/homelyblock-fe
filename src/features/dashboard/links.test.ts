import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ADMIN_ACTION_LINKS,
  activityHref,
  formatMoney,
  RESIDENT_ACTION_LINKS,
} from "./links.ts";

describe("dashboard links", () => {
  it("maps activity hints to module routes", () => {
    assert.equal(
      activityHref("s1", {
        id: "1",
        type: "notice.publish",
        title: "t",
        occurredAt: "2026-01-01",
        hrefHint: "notice:n1",
      }),
      "/societies/s1/notices/n1",
    );
    assert.equal(
      activityHref("s1", {
        id: "2",
        type: "x",
        title: "t",
        occurredAt: "2026-01-01",
        hrefHint: "billing",
      }),
      "/societies/s1/billing",
    );
  });

  it("exposes role-specific quick actions", () => {
    assert.ok(RESIDENT_ACTION_LINKS.submit_complaint);
    assert.ok(ADMIN_ACTION_LINKS.generate_bills);
    assert.equal(formatMoney("12.50"), "₹12.50");
  });
});
