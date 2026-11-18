import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateContact } from "./contact-schema.ts";

const valid = {
  fullName: "Asha Menon",
  email: "asha@example.com",
  subject: "Getting started",
  message: "How does a society administrator create a society?",
  societyName: "",
  privacyAcknowledged: true,
};

describe("validateContact", () => {
  it("accepts a complete message", () => {
    assert.deepEqual(validateContact(valid), {});
  });

  it("requires the privacy acknowledgement and a useful message", () => {
    const errors = validateContact({
      ...valid,
      message: "short",
      privacyAcknowledged: false,
    });
    assert.ok(errors.message);
    assert.ok(errors.privacyAcknowledged);
  });
});
