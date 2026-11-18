import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatDate,
  formatDateTime,
  formatDateTimeLocalIndia,
  indiaDateTimeLocalToIso,
} from "./format-date.ts";

describe("formatDateTime", () => {
  it("uses a fixed India zone so server and browser text match", () => {
    assert.equal(formatDateTime("2026-01-15T18:30:00.000Z"), "16 Jan 2026, 12:00 am");
    assert.equal(formatDate("2026-01-15T18:30:00.000Z"), "16 Jan 2026");
    assert.equal(formatDateTime(null), "—");
    assert.equal(formatDateTime("not-a-date"), "—");
  });

  it("treats datetime-local values as India time", () => {
    const instant = new Date("2026-01-15T18:30:00.000Z");
    assert.equal(formatDateTimeLocalIndia(instant), "2026-01-16T00:00");
    assert.equal(
      indiaDateTimeLocalToIso("2026-01-16T00:00"),
      "2026-01-15T18:30:00.000Z",
    );
    assert.equal(indiaDateTimeLocalToIso("2026-02-31T10:00"), null);
    assert.equal(indiaDateTimeLocalToIso("not-a-date"), null);
    assert.equal(
      indiaDateTimeLocalToIso("2026-06-15T00:00"),
      "2026-06-14T18:30:00.000Z",
    );
    assert.equal(
      formatDateTime("2026-06-14T18:30:00.000Z"),
      "15 Jun 2026, 12:00 am",
    );
  });
});
