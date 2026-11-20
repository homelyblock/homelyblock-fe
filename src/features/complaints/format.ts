import type { ComplaintPriority, ComplaintStatus } from "./types";

export function complaintStatusTone(status: ComplaintStatus): string {
  switch (status) {
    case "OPEN":
    case "REOPENED":
    case "IN_PROGRESS":
      return "bg-warning/10 text-warning";
    case "ACKNOWLEDGED":
      return "bg-info/10 text-info";
    case "RESOLVED":
      return "bg-success/10 text-success";
    case "CLOSED":
      return "bg-muted text-foreground";
    default:
      return "bg-muted text-foreground";
  }
}

export function complaintPriorityTone(priority: ComplaintPriority): string {
  switch (priority) {
    case "URGENT":
    case "HIGH":
      return "bg-destructive/10 text-destructive";
    case "MEDIUM":
      return "bg-warning/10 text-warning";
    default:
      return "bg-muted text-foreground";
  }
}
