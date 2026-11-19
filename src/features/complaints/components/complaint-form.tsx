"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { controlClassName, textareaClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { focusFirstInvalid, lockForm, preservedSubmit, unlockForm } from "@/lib/form-submit";
import { ApiError } from "@/services/api-client";
import { createComplaint } from "../api";
import type { ComplaintCategory, ComplaintPriority } from "../types";

type ComplaintFormProps = {
  societyId: string;
};

export function ComplaintForm({ societyId }: ComplaintFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData, form: HTMLFormElement) {
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
      setMessage(t("common.checkFields"));
      focusFirstInvalid(form, next);
      return;
    }

    if (form.dataset.locked === "1") return;
    setFieldErrors({});
    lockForm(form);
    guard(async () => {
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
        setMessage(t("complaints.submitted"));
        router.push(`/societies/${societyId}/complaints/${created.id}`);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : t("complaints.failed"),
        );
      } finally {
        unlockForm(form);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {t("complaints.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("complaints.help")}
        </p>
      </div>
      <AuthStatus status={status} message={message} />
      <form noValidate onSubmit={preservedSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-card p-4">
        <Field id="title" name="title" label={t("complaints.fieldTitle")} error={fieldErrors.title} />
        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground"
          >
            {t("complaints.description")}
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
              {t("complaints.category")}
            </label>
            <select
              id="category"
              name="category"
              className={controlClassName}
              defaultValue="GENERAL"
            >
              <option value="PLUMBING">{t("status.PLUMBING")}</option>
              <option value="ELECTRICAL">{t("status.ELECTRICAL")}</option>
              <option value="CLEANING">{t("status.CLEANING")}</option>
              <option value="LIFT">{t("status.LIFT")}</option>
              <option value="SECURITY">{t("status.SECURITY")}</option>
              <option value="PARKING">{t("status.PARKING")}</option>
              <option value="GENERAL">{t("status.GENERAL")}</option>
              <option value="OTHER">{t("status.OTHER")}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-foreground"
            >
              {t("complaints.priority")}
            </label>
            <select
              id="priority"
              name="priority"
              className={controlClassName}
              defaultValue="MEDIUM"
            >
              <option value="LOW">{t("status.LOW")}</option>
              <option value="MEDIUM">{t("status.MEDIUM")}</option>
              <option value="HIGH">{t("status.HIGH")}</option>
              <option value="URGENT">{t("status.URGENT")}</option>
            </select>
          </div>
        </div>
        <Button type="submit" disabled={pending} aria-busy={pending}>
          {pending ? t("complaints.submitting") : t("complaints.submit")}
        </Button>
      </form>
    </div>
  );
}
