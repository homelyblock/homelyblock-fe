import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fieldErrorMap, runExclusive } from "./form-submit.ts";

describe("fieldErrorMap", () => {
  it("keeps field messages and drops empty entries", () => {
    assert.deepEqual(
      fieldErrorMap({
        name: ["Society name is required."],
        city: undefined,
        state: [],
      }),
      { name: ["Society name is required."] },
    );
  });
});

describe("runExclusive", () => {
  it("runs once until the request settles, including a second Enter", async () => {
    const gate = { current: false };
    let started = 0;
    let release: (() => void) | undefined;
    const start = (callback: () => void) => callback();
    const first = runExclusive(gate, start, () => {
      started += 1;
      return new Promise<void>((resolve) => {
        release = resolve;
      });
    });
    const second = runExclusive(gate, start, async () => {
      started += 1;
    });

    assert.equal(first, true);
    assert.equal(second, false);
    assert.equal(started, 1);
    assert.equal(gate.current, true);
    release?.();
    await Promise.resolve();
    assert.equal(gate.current, false);

    const third = runExclusive(gate, start, async () => {
      started += 1;
    });
    assert.equal(third, true);
    assert.equal(started, 2);
  });
});
