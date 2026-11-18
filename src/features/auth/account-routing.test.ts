import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  homePathForAccount,
  signInPathForEntry,
  signOutDestination,
  signupIntentPayload,
  signupMetadata,
  toOnboardingRequest,
} from "./account-routing.ts";

describe("homePathForAccount", () => {
  it("sends the platform owner to the society list", () => {
    assert.equal(
      homePathForAccount({ platformRole: "PLATFORM_OWNER", memberships: [] }),
      "/societies",
    );
  });

  it("sends a new account to role setup", () => {
    assert.equal(
      homePathForAccount({ platformRole: null, memberships: [] }),
      "/onboarding",
    );
  });

  it("shows the pending page when the only membership is not active", () => {
    assert.equal(
      homePathForAccount({
        platformRole: null,
        accountType: "SOCIETY_ADMIN",
        memberships: [{ status: "INVITED", societyId: "palm" }],
      }),
      "/onboarding/pending",
    );
    assert.equal(
      homePathForAccount({
        platformRole: null,
        accountType: "RESIDENT_USER",
        memberships: [{ status: "SUSPENDED", societyId: "palm" }],
      }),
      "/onboarding/pending",
    );
    assert.equal(
      homePathForAccount({
        platformRole: null,
        accountType: "RESIDENT_USER",
        memberships: [{ status: "REMOVED", societyId: "palm" }],
      }),
      "/onboarding/pending",
    );
  });

  it("keeps a resident without a membership on the pending page", () => {
    assert.equal(
      homePathForAccount({
        platformRole: null,
        accountType: "RESIDENT_USER",
        memberships: [],
      }),
      "/onboarding/pending",
    );
  });

  it("opens the only active society after login", () => {
    assert.equal(
      homePathForAccount({
        platformRole: null,
        accountType: "SOCIETY_ADMIN",
        memberships: [
          { status: "INVITED", societyId: "ignored" },
          { status: "ACTIVE", societyId: "palm" },
        ],
      }),
      "/societies/palm",
    );
  });

  it("uses the society list when several memberships are active", () => {
    assert.equal(
      homePathForAccount({
        platformRole: null,
        accountType: "RESIDENT_USER",
        memberships: [
          { status: "ACTIVE", societyId: "one" },
          { status: "ACTIVE", societyId: "two" },
        ],
      }),
      "/societies",
    );
  });
});

describe("sign-in entry", () => {
  it("keeps member and platform owner sign-in separate", () => {
    assert.equal(signInPathForEntry("member"), "/sign-in");
    assert.equal(signInPathForEntry("platform"), "/admin/sign-in");
  });

  it("only accepts the platform owner return path on sign-out", () => {
    assert.equal(signOutDestination("/admin/sign-in"), "/admin/sign-in");
    assert.equal(signOutDestination("/sign-in"), "/sign-in");
    assert.equal(signOutDestination("https://evil.example"), "/sign-in");
    assert.equal(signOutDestination(null), "/sign-in");
  });
});

describe("toOnboardingRequest", () => {
  it("drops society fields for a resident", () => {
    assert.deepEqual(
      toOnboardingRequest({
        accountType: "RESIDENT_USER",
        societyName: "Palm Court",
        city: "Pune",
        phone: "+919800011122",
      }),
      { accountType: "RESIDENT_USER", phone: "+919800011122" },
    );
  });

  it("rejects platform owner selection", () => {
    assert.throws(() =>
      toOnboardingRequest({ accountType: "PLATFORM_OWNER" }),
    );
  });
});

describe("signup intent", () => {
  it("keeps Supabase metadata to the display name", () => {
    assert.deepEqual(
      signupMetadata({ fullName: "Asha Rao" }),
      { full_name: "Asha Rao" },
    );
    assert.equal("account_type" in signupMetadata({ fullName: "Asha Rao" }), false);
  });

  it("sends a society administrator choice only to the server record", () => {
    assert.deepEqual(
      signupIntentPayload("11111111-1111-4111-8111-111111111111", {
        accountType: "SOCIETY_ADMIN",
        societyName: "Palm Court",
        city: "Pune",
        state: "Maharashtra",
        phone: "+919800011122",
      }),
      {
        userId: "11111111-1111-4111-8111-111111111111",
        accountType: "SOCIETY_ADMIN",
        societyName: "Palm Court",
        city: "Pune",
        state: "Maharashtra",
        phone: "+919800011122",
      },
    );
  });

  it("drops society fields from a resident intent", () => {
    assert.deepEqual(
      signupIntentPayload("11111111-1111-4111-8111-111111111111", {
        accountType: "RESIDENT_USER",
        societyName: "Should not be kept",
        city: "Pune",
        phone: "+919800011122",
      }),
      {
        userId: "11111111-1111-4111-8111-111111111111",
        accountType: "RESIDENT_USER",
        phone: "+919800011122",
      },
    );
  });
});
