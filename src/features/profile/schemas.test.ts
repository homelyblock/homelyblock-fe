import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { profileFormSchema } from "./schemas.ts";

describe("profileFormSchema", () => {
  it("accepts a valid profile payload", () => {
    const parsed = profileFormSchema.safeParse({
      displayName: "Priya Sharma",
      phone: "+919876543210",
    });
    assert.equal(parsed.success, true);
  });

  it("allows clearing phone and rejects short names", () => {
    const cleared = profileFormSchema.safeParse({
      displayName: "Priya Sharma",
      phone: "",
    });
    assert.equal(cleared.success, true);
    if (cleared.success) assert.equal(cleared.data.phone, null);

    const short = profileFormSchema.safeParse({
      displayName: "P",
      phone: "",
    });
    assert.equal(short.success, false);
  });
});
