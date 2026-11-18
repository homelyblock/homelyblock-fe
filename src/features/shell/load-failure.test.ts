import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { loadFailureDestination } from "./load-failure.ts";

class StatusError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("request failed");
    this.status = status;
  }
}

describe("loadFailureDestination", () => {
  it("keeps authentication failures distinct from outages", () => {
    assert.equal(loadFailureDestination(new StatusError(401)), "session-expired");
    assert.equal(loadFailureDestination(new StatusError(403)), "forbidden");
    assert.equal(loadFailureDestination(new StatusError(404)), "not-found");
    assert.equal(loadFailureDestination(new StatusError(400)), "not-found");
    assert.equal(loadFailureDestination(new StatusError(503)), "unavailable");
    assert.equal(loadFailureDestination(new TypeError("fetch failed")), "unavailable");
  });
});
