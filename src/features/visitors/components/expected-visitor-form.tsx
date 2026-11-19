"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useRouter } from "next/navigation";
import { preservedSubmit } from "@/lib/form-submit";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { textareaClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";
import { indiaDateTimeLocalToIso } from "@/lib/format-date";
import { createExpectedVisitor } from "../api";
import { expectedVisitorSchema } from "../schemas";

type ExpectedVisitorFormProps = {
  societyId: string;
};

export function ExpectedVisitorForm({ societyId }: ExpectedVisitorFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData) {
    const localExpected = String(formData.get("expectedAt") || "");
    const expectedAt = localExpected
      ? indiaDateTimeLocalToIso(localExpected)
      : "";
    if (localExpected && !expectedAt) {
      setFieldErrors({ expectedAt: ["Enter a valid date and time."] });
      setStatus("error");
      setMessage("Enter a valid date and time.");
      return;
    }

    const parsed = expectedVisitorSchema.safeParse({
      visitorName: formData.get("visitorName"),
      visitorPhone: formData.get("visitorPhone"),
      purpose: formData.get("purpose"),
      expectedAt,
      vehicleNumber: formData.get("vehicleNumber") || "",
      notes: formData.get("notes") || "",
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const next: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(flattened)) {
        if (value && value.length > 0) next[key] = value;
      }
      setFieldErrors(next);
      setStatus("error");
      setMessage("Check the highlighted fields.");
      return;
    }

    setFieldErrors({});
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        const created = await createExpectedVisitor(token, societyId, {
          visitorName: parsed.data.visitorName,
          visitorPhone: parsed.data.visitorPhone,
          purpose: parsed.data.purpose,
          expectedAt: parsed.data.expectedAt,
          ...(parsed.data.vehicleNumber
            ? { vehicleNumber: parsed.data.vehicleNumber }
            : {}),
          ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
        });
        setStatus("success");
        setMessage("Visitor registered.");
        router.push(`/societies/${societyId}/visitors/${created.id}`);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to register visitor.",
        );
      }
    });
  }

  return (
    <form
      noValidate onSubmit={preservedSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-border bg-card px-5 py-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Register expected visitor
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Linked to your active unit membership. Requests start as pending.
        </p>
      </div>

      <Field
        id="visitor-name"
        name="visitorName"
        label={t("forms.visitorName")}
        error={fieldErrors.visitorName}
      />
      <Field
        id="visitor-phone"
        name="visitorPhone"
        label={t("forms.phone")}
        error={fieldErrors.visitorPhone}
      />
      <Field
        id="visitor-purpose"
        name="purpose"
        label={t("forms.purpose")}
        error={fieldErrors.purpose}
      />
      <Field
        id="visitor-expected"
        name="expectedAt"
        label={t("forms.expectedAt")}
        type="datetime-local"
        error={fieldErrors.expectedAt}
      />
      <Field
        id="visitor-vehicle"
        name="vehicleNumber"
        label={t("forms.vehicleOptional")}
        error={fieldErrors.vehicleNumber}
      />
      <div className="space-y-1.5">
        <label
          htmlFor="visitor-notes"
          className="block text-sm font-medium text-foreground"
        >
          Notes (optional)
        </label>
        <textarea
          id="visitor-notes"
          name="notes"
          rows={3}
          className={textareaClassName}
        />
      </div>

      <AuthStatus status={status} message={message} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Register visitor"}
      </Button>
    </form>
  );
}
