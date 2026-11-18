import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatStatus, statusTone } from "./status-tone.ts";

describe("status presentation", () => {
  it("formats enum labels for people", () => {
    assert.equal(formatStatus("PARTIALLY_PAID"), "Partially Paid");
    assert.equal(statusTone("INVITED"), "warning");
    assert.equal(statusTone("REMOVED"), "danger");
  });

  it("maps known statuses to tones", () => {
    assert.equal(statusTone("PUBLISHED"), "success");
    assert.equal(statusTone("OPEN"), "warning");
    assert.equal(statusTone("OVERDUE"), "danger");
    assert.equal(statusTone("CHECKED_IN"), "info");
    assert.equal(statusTone("CUSTOM"), "neutral");
  });
});
