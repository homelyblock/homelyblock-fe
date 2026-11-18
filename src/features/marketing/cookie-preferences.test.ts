import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowsOptionalTracking,
  parsePreferences,
  preferencesFor,
  readPreferencesFromDocumentCookie,
  serializePreferences,
} from "./cookie-preferences.ts";

describe("cookie preferences", () => {
  it("keeps optional categories off for every choice", () => {
    for (const choice of ["accept_all", "reject_non_essential", "custom"] as const) {
      const saved = preferencesFor(choice, "2026-11-18T00:00:00.000Z");
      assert.equal(saved.essential, true);
      assert.equal(saved.analytics, false);
      assert.equal(saved.marketing, false);
      assert.equal(saved.functional, false);
    }
    assert.equal(allowsOptionalTracking(), false);
  });

  it("round-trips a saved choice and rejects a tampered analytics flag", () => {
    const saved = preferencesFor("reject_non_essential", "2026-11-18T00:00:00.000Z");
    const raw = serializePreferences(saved);
    assert.deepEqual(parsePreferences(raw)?.choice, "reject_non_essential");
    assert.equal(
      parsePreferences(encodeURIComponent(JSON.stringify({ ...saved, analytics: true }))),
      null,
    );
  });

  it("reads the preference cookie and ignores other cookies", () => {
    const saved = preferencesFor("custom", "2026-11-18T00:00:00.000Z");
    const header = `sb-access-token=secret; ls_cookie_preferences=${serializePreferences(saved)}`;
    assert.equal(readPreferencesFromDocumentCookie(header)?.choice, "custom");
    assert.equal(readPreferencesFromDocumentCookie("sb-access-token=secret"), null);
  });
});
