"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName, textareaClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { createComplaint } from "../api";
import type { ComplaintCategory, ComplaintPriority } from "../types";

type ComplaintFormProps = {
  societyId: string;
};

export function ComplaintForm({ societyId }: ComplaintFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const category = String(formData.get("category") ?? "") as ComplaintCategory;
    const priority = String(
      formData.get("priority") ?? "MEDIUM",
    ) as ComplaintPriority;

    const next: Record<string, string[]> = {};
    if (title.length < 3) next.title = ["Title must be at least 3 characters."];
    if (description.length < 5)
      next.description = ["Description must be at least 5 characters."];
    if (!category) next.category = ["Category is required."];
    if (Object.keys(next).length > 0) {
      setFieldErrors(next);
      setStatus("error");
      setMessage("Check the highlighted fields.");
      return;
    }

    setFieldErrors({});
    startTransition(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        const created = await createComplaint(token, societyId, {
          title,
          description,
          category,
          priority,
        });
        setStatus("success");
        setMessage("Complaint submitted.");
        router.push(`/societies/${societyId}/complaints/${created.id}`);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to submit complaint.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Submit complaint
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Building and unit are taken from your active membership. You cannot
          file for another unit.
        </p>
      </div>
      <AuthStatus status={status} message={message} />
      <form action={onSubmit} className="space-y-4 rounded-lg border border-border bg-card p-4">
        <Field id="title" name="title" label="Title" error={fieldErrors.title} />
        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            className={textareaClassName}
            aria-invalid={Boolean(fieldErrors.description?.length)}
          />
          {fieldErrors.description?.[0] ? (
            <p className="text-sm text-destructive">{fieldErrors.description[0]}</p>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-foreground"
            >
              Category
            </label>
            <select
              id="category"
              name="category"
              className={controlClassName}
              defaultValue="GENERAL"
            >
              <option value="PLUMBING">Plumbing</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="CLEANING">Cleaning</option>
              <option value="LIFT">Lift</option>
              <option value="SECURITY">Security</option>
              <option value="PARKING">Parking</option>
              <option value="GENERAL">General</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-foreground"
            >
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className={controlClassName}
              defaultValue="MEDIUM"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting…" : "Submit complaint"}
        </Button>
      </form>
    </div>
  );
}
