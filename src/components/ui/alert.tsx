import type { ReactNode } from "react";

type AlertProps = {
  tone?: "error" | "warning" | "success";
  children: ReactNode;
};

const tones = {
  error: "border-destructive/25 border-l-destructive bg-destructive/10 text-destructive",
  warning: "border-warning/30 border-l-warning bg-warning/10 text-warning",
  success: "border-success/30 border-l-success bg-success/10 text-success",
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
