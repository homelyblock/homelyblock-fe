import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  onboardingSchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from "./schemas.ts";

describe("auth form validation", () => {
  it("requires an email and password to sign in", () => {
    const result = signInSchema.safeParse({ email: "not-an-email", password: "" });
    assert.equal(result.success, false);
    if (!result.success) {
      const fields = result.error.flatten().fieldErrors;
      assert.ok(fields.email?.length);
      assert.ok(fields.password?.length);
    }
  });

  it("rejects mismatched sign-up passwords", () => {
    const result = signUpSchema.safeParse({
      fullName: "Asha Rao",
      email: "asha@example.com",
      password: "long-enough",
      confirmPassword: "different",
      accountType: "RESIDENT_USER",
    });
    assert.equal(result.success, false);
  });

  it("requires an explicit society admin or resident choice", () => {
    const missing = signUpSchema.safeParse({
      fullName: "Asha Rao",
      email: "asha@example.com",
      password: "long-enough",
      confirmPassword: "long-enough",
    });
    assert.equal(missing.success, false);

    const owner = onboardingSchema.safeParse({ accountType: "PLATFORM_OWNER" });
    assert.equal(owner.success, false);
  });

  it("requires society details only for a society administrator", () => {
    const resident = onboardingSchema.safeParse({
      accountType: "RESIDENT_USER",
      phone: "+919800011122",
    });
    assert.equal(resident.success, true);

    const admin = onboardingSchema.safeParse({
      accountType: "SOCIETY_ADMIN",
      societyName: "Palm Court",
    });
    assert.equal(admin.success, false);
  });

  it("rejects a short replacement password", () => {
    const result = passwordUpdateSchema.safeParse({
      password: "short",
      confirmPassword: "short",
    });
    assert.equal(result.success, false);
  });
});
