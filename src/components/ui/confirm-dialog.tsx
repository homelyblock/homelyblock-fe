"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";
import { Button } from "./button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "default" | "danger";
  pending?: boolean;
  error?: string;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  pending = false,
  error,
  children,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className="w-full max-w-md rounded-2xl border border-border bg-card text-foreground shadow-2xl"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel();
      }}
      onClose={() => {
        if (!pending) onCancel();
      }}
      onCancel={(event) => {
        if (pending) event.preventDefault();
      }}
    >
      <div className="space-y-4 p-5">
        <div className="space-y-1">
          <h2 id={titleId} className="text-base font-semibold text-foreground">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {children}
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={tone === "danger" ? "destructive" : "default"}
            className={
              tone === "danger"
                ? "bg-destructive text-white hover:bg-destructive/90"
                : undefined
            }
            disabled={pending}
            onClick={() => {
              if (!pending) onConfirm();
            }}
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
