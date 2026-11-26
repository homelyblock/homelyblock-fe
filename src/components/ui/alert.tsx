import type { ReactNode } from "react";

type AlertProps = {
  tone?: "error" | "warning" | "success";
  children: ReactNode;
};

/**
 * Calm notice styles: tinted surface + colored edge, readable foreground text.
 * Avoid saturated “alarm” text that feels technical or harsh on mobile.
 */
const tones = {
  error:
    "border-border border-l-[color:var(--theme-danger)] bg-[color-mix(in_srgb,var(--theme-danger)_9%,var(--theme-surface))] text-foreground",
  warning:
    "border-border border-l-[color:var(--theme-warning)] bg-[color-mix(in_srgb,var(--theme-warning)_10%,var(--theme-surface))] text-foreground",
  success:
    "border-border border-l-[color:var(--theme-success)] bg-[color-mix(in_srgb,var(--theme-success)_10%,var(--theme-surface))] text-foreground",
};

export function Alert({ tone = "error", children }: AlertProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border border-l-4 px-4 py-3 text-sm leading-6 ${tones[tone]}`}
    >
      {children}
    </div>
  );
}
