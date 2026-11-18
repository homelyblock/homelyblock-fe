import type { ComplaintPriority, ComplaintStatus } from "./types";

export function complaintStatusTone(status: ComplaintStatus): string {
  switch (status) {
    case "OPEN":
    case "REOPENED":
      return "bg-amber-100 text-amber-900";
    case "ACKNOWLEDGED":
      return "bg-sky-100 text-sky-900";
    case "IN_PROGRESS":
      return "bg-indigo-100 text-indigo-900";
    case "RESOLVED":
      return "bg-emerald-100 text-emerald-900";
    case "CLOSED":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function complaintPriorityTone(priority: ComplaintPriority): string {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-900";
    case "HIGH":
      return "bg-orange-100 text-orange-900";
    case "MEDIUM":
      return "bg-amber-50 text-amber-900";
    default:
      return "bg-slate-100 text-slate-700";
  }
}
