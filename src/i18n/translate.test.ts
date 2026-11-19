import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { messages as en } from "./messages/en.ts";
import { messages as hi } from "./messages/hi.ts";
import { messages as mr } from "./messages/mr.ts";
import { messageKeys, translate } from "./translate.ts";
import { t } from "./index.ts";
import { knownMessageKeys } from "./known-messages.ts";

describe("translations", () => {
  it("keeps Marathi and Hindi catalogs aligned with English", () => {
    const english = messageKeys(en).sort();
    assert.deepEqual(messageKeys(mr).sort(), english);
    assert.deepEqual(messageKeys(hi).sort(), english);
  });

  it("interpolates and falls back to English", () => {
    assert.equal(translate(en, "nav.pending", { count: 3 }), "3 needing attention");
    assert.equal(t("hi", "nav.complaints"), "शिकायतें");
    assert.equal(t("mr", "missing.key"), "missing.key");
  });

  it("translates every known validation and feedback sentence", () => {
    for (const key of Object.values(knownMessageKeys)) {
      assert.notEqual(t("en", key), key, key);
      assert.notEqual(t("mr", key), key, key);
      assert.notEqual(t("hi", key), key, key);
    }
    assert.equal(t("hi", "validation.nameRequired"), "नाम आवश्यक है");
  });
});
