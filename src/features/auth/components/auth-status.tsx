"use client";

import { translateKnown } from "@/i18n/known-messages.ts";
import { useI18n } from "@/i18n/provider";

type AuthStatusProps = {
  status: "idle" | "error" | "success";
  message?: string;
};

export function AuthStatus({ status, message }: AuthStatusProps) {
  const { t } = useI18n();
  if (status === "idle" || !message) {
    return null;
  }
  const text = translateKnown(message, t);

  const tone =
    status === "error"
      ? "border-destructive/25 border-l-destructive bg-destructive/10 text-destructive"
      : "border-success/30 border-l-success bg-success/10 text-success";

  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`rounded-xl border border-l-4 px-4 py-3 text-sm leading-6 ${tone}`}
    >
      {text}
    </p>
  );
}
