import type { ReactNode } from "react";
import { formatStatus, statusTone, type StatusTone } from "./status-tone";

const tones: Record<StatusTone, string> = {
  neutral: "bg-muted text-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-teal/10 text-teal",
};

type StatusBadgeProps = {
  value: string;
  tone?: StatusTone;
};

export function StatusBadge({ value, tone }: StatusBadgeProps) {
  const resolved = tone ?? statusTone(value);
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[resolved]}`}
    >
      {formatStatus(value)}
    </span>
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
