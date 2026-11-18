const DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Kolkata",
});

const DATE_ONLY = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeZone: "Asia/Kolkata",
});

function parseDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Society timestamps are shown in India time so server and browser render the same text. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseDate(value);
  return date ? DATE_TIME.format(date) : "—";
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = parseDate(value);
  return date ? DATE_ONLY.format(date) : "—";
}

/** Value for a datetime-local input, shown as India time. */
export function formatDateTimeLocalIndia(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

/**
 * A datetime-local value has no timezone. Society times are India time,
 * including when the browser is set somewhere else.
 */
export function indiaDateTimeLocalToIso(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }
  const date = new Date(
    `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:00+05:30`,
  );
  if (Number.isNaN(date.getTime())) return null;
  if (formatDateTimeLocalIndia(date) !== value.trim()) return null;
  return date.toISOString();
}
