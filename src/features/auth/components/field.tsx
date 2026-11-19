"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { translateKnown } from "@/i18n/known-messages.ts";
import { useI18n } from "@/i18n/provider";
import {
  controlClassName,
  fieldErrorClassName,
  fieldHintClassName,
  fieldLabelClassName,
} from "@/components/ui/control";

type FieldProps = {
  id: string;
  label: string;
  description?: string;
  error?: string[];
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export function Field({
  id,
  label,
  description,
  error,
  children,
  required,
  ...inputProps
}: FieldProps) {
  const { t } = useI18n();
  const descriptionId = description ? `${id}-hint` : undefined;
  const errorId = error?.length ? `${id}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className={fieldLabelClassName}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {description ? (
        <p id={descriptionId} className={fieldHintClassName}>
          {description}
        </p>
      ) : null}
      {children ?? (
        <input
          id={id}
          required={required}
          aria-invalid={Boolean(error?.length) || undefined}
          aria-describedby={describedBy}
          className={controlClassName}
          {...inputProps}
        />
      )}
      {error?.length ? (
        <p id={errorId} role="alert" className={fieldErrorClassName}>
          {translateKnown(error[0], t)}
        </p>
      ) : null}
    </div>
  );
}
