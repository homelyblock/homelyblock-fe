import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { breadcrumbItems } from "./breadcrumb-model.ts";

describe("breadcrumbItems", () => {
  it("labels society modules and ids", () => {
    const societyId = "11111111-1111-1111-1111-111111111111";
    const noticeId = "22222222-2222-2222-2222-222222222222";
    assert.deepEqual(
      breadcrumbItems(`/societies/${societyId}/notices/${noticeId}`).map(
        (item) => item.label,
      ),
      ["Societies", "Society", "Notices", "Details"],
    );
  });

  it("labels profile edit", () => {
    assert.deepEqual(
      breadcrumbItems("/profile/edit").map((item) => item.label),
      ["Profile", "Edit"],
    );
  });
});
