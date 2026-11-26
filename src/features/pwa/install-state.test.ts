import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canShowInstallCta,
  canShowIosInstallHint,
} from "./install-state.ts";

describe("PWA install visibility", () => {
  it("hides install CTA when already standalone or dismissed", () => {
    assert.equal(
      canShowInstallCta({ standalone: true, hasPrompt: true, dismissed: false }),
      false,
    );
    assert.equal(
      canShowInstallCta({ standalone: false, hasPrompt: true, dismissed: true }),
      false,
    );
    assert.equal(
      canShowInstallCta({ standalone: false, hasPrompt: false, dismissed: false }),
      false,
    );
    assert.equal(
      canShowInstallCta({ standalone: false, hasPrompt: true, dismissed: false }),
      true,
    );
  });

  it("shows iOS hint only on iOS Safari when not installed", () => {
    assert.equal(
      canShowIosInstallHint({
        standalone: false,
        isIos: true,
        isSafari: true,
        dismissed: false,
      }),
      true,
    );
    assert.equal(
      canShowIosInstallHint({
        standalone: false,
        isIos: true,
        isSafari: false,
        dismissed: false,
      }),
      false,
    );
    assert.equal(
      canShowIosInstallHint({ standalone: true, isIos: true, isSafari: true, dismissed: false }),
      false,
    );
    assert.equal(
      canShowIosInstallHint({
        standalone: false,
        isIos: false,
        isSafari: false,
        dismissed: false,
      }),
      false,
    );
    assert.equal(
      canShowIosInstallHint({
        standalone: false,
        isIos: true,
        isSafari: true,
        dismissed: true,
      }),
      false,
    );
  });
});
