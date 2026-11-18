export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const SUCCESS = new Set([
  "ACTIVE",
  "PUBLISHED",
  "PAID",
  "APPROVED",
  "RESOLVED",
  "CHECKED_OUT",
  "CLOSED",
]);

const WARNING = new Set([
  "DRAFT",
  "PENDING",
  "PENDING_APPROVAL",
  "OPEN",
  "UNPAID",
  "EXPECTED",
  "PARTIAL",
  "PARTIALLY_PAID",
  "IN_PROGRESS",
  "DUE",
  "REOPENED",
  "MEDIUM",
  "INVITED",
]);

const DANGER = new Set([
  "ARCHIVED",
  "REJECTED",
  "CANCELLED",
  "CANCELED",
  "OVERDUE",
  "INACTIVE",
  "SUSPENDED",
  "EXPIRED",
  "HIGH",
  "URGENT",
  "REMOVED",
  "REVERSED",
]);

const INFO = new Set([
  "CHECKED_IN",
  "ACKNOWLEDGED",
  "SOCIETY_ADMIN",
  "RESIDENT_USER",
  "PLATFORM_OWNER",
]);

export function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

export function statusTone(value: string): StatusTone {
  const normalized = value.trim().toUpperCase().replaceAll(" ", "_");
  if (SUCCESS.has(normalized)) return "success";
  if (WARNING.has(normalized)) return "warning";
  if (DANGER.has(normalized)) return "danger";
  if (INFO.has(normalized)) return "info";
  return "neutral";
}
