import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  filterOccupancyByQuery,
  householdMemberFormSchema,
} from "./schemas.ts";

describe("householdMemberFormSchema", () => {
  it("accepts a valid household member", () => {
    const parsed = householdMemberFormSchema.safeParse({
      name: "Aarav Sharma",
      relationship: "CHILD",
      phone: "+919876543210",
      email: "aarav@example.com",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects invalid relationship and phone", () => {
    const parsed = householdMemberFormSchema.safeParse({
      name: "A",
      relationship: "PET",
      phone: "abc",
    });
    assert.equal(parsed.success, false);
  });
});

describe("filterOccupancyByQuery", () => {
  it("filters residents by name or email", () => {
    const items = [
      { displayName: "Priya Sharma", email: "priya@example.com" },
      { displayName: "Amit Patel", email: "amit@example.com" },
    ];
    assert.deepEqual(filterOccupancyByQuery(items, "priya"), [items[0]]);
    assert.deepEqual(filterOccupancyByQuery(items, "amit@"), [items[1]]);
  });
});
