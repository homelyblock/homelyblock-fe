import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countForNav } from "./attention.ts";

describe("countForNav", () => {
  it("shows only actionable counts for the matching section", () => {
    const counts = {
      complaints: 3,
      members: 2,
      visitors: 0,
      notices: 1,
      billing: 4,
    };
    assert.equal(countForNav("complaints", counts), 3);
    assert.equal(countForNav("members", counts), 2);
    assert.equal(countForNav("visitors", counts), 0);
    assert.equal(countForNav("overview", counts), 0);
    assert.equal(countForNav("household", counts), 0);
    assert.equal(countForNav("services", undefined), 0);
  });
});