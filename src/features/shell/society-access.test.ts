import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { MeResponse } from "../societies/types.ts";
import { directoryAccessRedirect } from "./society-access.ts";

const societyId = "11111111-1111-4111-8111-111111111111";

function account(
  overrides: Partial<MeResponse> & Pick<MeResponse, "memberships" | "platformRole">,
): MeResponse {
  return {
    id: "22222222-2222-4222-8222-222222222222",
    email: "person@example.com",
    displayName: "Person",
    ...overrides,
  };
}

describe("directoryAccessRedirect", () => {
  it("lets an active society admin open the directory", () => {
    const destination = directoryAccessRedirect(
      account({
        platformRole: null,
        memberships: [
          {
            id: "m1",
            role: "SOCIETY_ADMIN",
            status: "ACTIVE",
            societyId,
          },
        ],
      }),
      societyId,
    );
    assert.equal(destination, null);
  });

  it("lets a platform owner open the directory", () => {
    const destination = directoryAccessRedirect(
      account({ platformRole: "PLATFORM_OWNER", memberships: [] }),
      societyId,
    );
    assert.equal(destination, null);
  });

  it("sends an active resident back to the society overview", () => {
    const destination = directoryAccessRedirect(
      account({
        platformRole: null,
        memberships: [
          {
            id: "m1",
            role: "RESIDENT_USER",
            status: "ACTIVE",
            societyId,
          },
        ],
      }),
      societyId,
    );
    assert.equal(destination, `/societies/${societyId}`);
  });

  it("rejects invited, suspended, and other-society memberships", () => {
    for (const status of ["INVITED", "SUSPENDED", "REMOVED"]) {
      const destination = directoryAccessRedirect(
        account({
          platformRole: null,
          memberships: [
            {
              id: "m1",
              role: "SOCIETY_ADMIN",
              status,
              societyId,
            },
          ],
        }),
        societyId,
      );
      assert.equal(destination, "/forbidden");
    }

    const otherSociety = directoryAccessRedirect(
      account({
        platformRole: null,
        memberships: [
          {
            id: "m1",
            role: "SOCIETY_ADMIN",
            status: "ACTIVE",
            societyId: "33333333-3333-4333-8333-333333333333",
          },
        ],
      }),
      societyId,
    );
    assert.equal(otherSociety, "/forbidden");
  });
});
