"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/i18n/provider";
import { formatStatus, statusTone, type StatusTone } from "./status-tone";

const tones: Record<StatusTone, string> = {
  neutral: "bg-muted text-foreground",
  success:
    "bg-[color-mix(in_srgb,var(--theme-success)_12%,var(--theme-surface))] text-foreground",
  warning:
    "bg-[color-mix(in_srgb,var(--theme-warning)_14%,var(--theme-surface))] text-foreground",
  danger:
    "bg-[color-mix(in_srgb,var(--theme-danger)_12%,var(--theme-surface))] text-foreground",
  info: "bg-[color-mix(in_srgb,var(--theme-info)_12%,var(--theme-surface))] text-foreground",
};

type StatusBadgeProps = {
  value: string;
  tone?: StatusTone;
};

export function StatusBadge({ value, tone }: StatusBadgeProps) {
  const { t } = useI18n();
  const resolved = tone ?? statusTone(value);
  const normalized = value.trim().toUpperCase().replaceAll(" ", "_");
  const key = `status.${normalized}`;
  const translated = t(key);
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${tones[resolved]}`}
    >
      {translated === key ? formatStatus(value) : translated}
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
