import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { userFacingError, userFacingMessage } from "./user-facing-message.ts";

describe("userFacingMessage", () => {
  it("keeps short human validation copy", () => {
    assert.equal(userFacingMessage("Name is required"), "Name is required");
    assert.equal(
      userFacingMessage("Enter an Indian phone number, such as +91 98765 43210"),
      "Enter an Indian phone number, such as +91 98765 43210",
    );
  });

  it("replaces developer and transport failures", () => {
    assert.equal(
      userFacingMessage("Sign in required", { status: 401, code: "UNAUTHORIZED" }),
      "Please sign in to continue.",
    );
    assert.equal(
      userFacingMessage("Internal Server Error", { status: 500 }),
      "Something went wrong on our side. Please try again.",
    );
    assert.equal(
      userFacingMessage("Failed to fetch", { status: 0 }),
      "Something went wrong. Please try again.",
    );
    assert.equal(
      userFacingMessage('prisma.user_profiles.findUnique\nInvalid `prisma`', {
        status: 500,
      }),
      "Something went wrong on our side. Please try again.",
    );
  });

  it("prefers human details over a technical summary", () => {
    assert.equal(
      userFacingMessage("Validation failed", {
        status: 422,
        details: ["Enter the society name.", "Enter the city."],
      }),
      "Enter the society name. Enter the city.",
    );
  });
});

describe("userFacingError", () => {
  it("reads ApiError-shaped objects", () => {
    assert.equal(
      userFacingError({ message: "Forbidden", status: 403, code: "FORBIDDEN" }),
      "You don’t have permission to do that.",
    );
    assert.equal(userFacingError(null), "Something went wrong. Please try again.");
  });
});
