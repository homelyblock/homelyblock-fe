import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userInitials } from "./user-initials.ts";

describe("userInitials", () => {
  it("uses first and last name initials", () => {
    assert.equal(userInitials("Ankit Patil"), "AP");
    assert.equal(userInitials("  Maya   Rao  "), "MR");
    assert.equal(userInitials("A B C"), "AC");
  });

  it("uses the first two letters of a single name", () => {
    assert.equal(userInitials("Ankit"), "AN");
    assert.equal(userInitials("李"), "李");
  });

  it("falls back to email and handles empty values", () => {
    assert.equal(userInitials(null, "resident@example.com"), "RE");
    assert.equal(userInitials("   ", "a@example.com"), "A");
    assert.equal(userInitials("", ""), "?");
    assert.equal(userInitials(undefined, undefined), "?");
    assert.equal(userInitials("   "), "?");
  });
});
