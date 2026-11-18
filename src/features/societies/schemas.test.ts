import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSocietySchema } from "./schemas.ts";

describe("createSocietySchema", () => {
  it("accepts a valid create payload", () => {
    const parsed = createSocietySchema.safeParse({
      name: "Green Valley",
      city: "Pune",
      state: "MH",
      initialAdminUserId: "11111111-1111-4111-8111-111111111111",
    });
    assert.equal(parsed.success, true);
  });

  it("rejects a short name and invalid admin id", () => {
    const parsed = createSocietySchema.safeParse({
      name: "A",
      initialAdminUserId: "not-a-uuid",
    });
    assert.equal(parsed.success, false);
  });
});
