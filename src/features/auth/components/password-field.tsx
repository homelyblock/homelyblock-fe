"use client";

import { useState } from "react";
import { controlClassName } from "@/components/ui/control";
import { useI18n } from "@/i18n/provider";
import { Field } from "./field";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  error?: string[];
  required?: boolean;
  minLength?: number;
};

export function PasswordField({
  id,
  name,
  label,
  autoComplete,
  error,
  required,
  minLength,
}: PasswordFieldProps) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  return (
    <Field id={id} label={label} error={error} required={required}>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          aria-invalid={Boolean(error?.length)}
          aria-describedby={error?.length ? `${id}-error` : undefined}
          className={`${controlClassName} pr-16`}
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded px-1.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/40"
          aria-pressed={visible}
          aria-controls={id}
          aria-label={visible ? `${t("work.hide")} ${label}` : `${t("work.show")} ${label}`}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? t("work.hide") : t("work.show")}
        </button>
      </div>
    </Field>
  );
}
