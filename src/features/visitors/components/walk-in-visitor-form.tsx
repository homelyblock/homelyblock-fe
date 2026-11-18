"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName, textareaClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { fetchUnits } from "@/features/society-structure/api";
import { ApiError } from "@/services/api-client";
import { indiaDateTimeLocalToIso } from "@/lib/format-date";
import { createWalkInVisitor } from "../api";
import { walkInVisitorSchema } from "../schemas";

type WalkInVisitorFormProps = {
  societyId: string;
};

export function WalkInVisitorForm({ societyId }: WalkInVisitorFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const unitsQuery = useQuery({
    queryKey: ["units", societyId, "all"],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchUnits(token, societyId);
    },
  });

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

    const parsed = walkInVisitorSchema.safeParse({
      unitId: formData.get("unitId"),
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
    startTransition(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        const created = await createWalkInVisitor(token, societyId, {
          unitId: parsed.data.unitId,
          visitorName: parsed.data.visitorName,
          visitorPhone: parsed.data.visitorPhone,
          purpose: parsed.data.purpose,
          ...(parsed.data.expectedAt
            ? { expectedAt: parsed.data.expectedAt }
            : {}),
          ...(parsed.data.vehicleNumber
            ? { vehicleNumber: parsed.data.vehicleNumber }
            : {}),
          ...(parsed.data.notes ? { notes: parsed.data.notes } : {}),
        });
        setStatus("success");
        setMessage("Walk-in registered as pending resident approval.");
        router.push(`/societies/${societyId}/visitors/${created.id}`);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to register walk-in.",
        );
      }
    });
  }

  return (
    <form
      action={onSubmit}
      className="space-y-4 rounded-lg border border-border bg-card px-5 py-5"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Register walk-in visitor
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Walk-ins stay pending until the unit resident approves or rejects.
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="walkin-unit"
          className="block text-sm font-medium text-foreground"
        >
          Unit
        </label>
        <select
          id="walkin-unit"
          name="unitId"
          defaultValue=""
          className={controlClassName}
        >
          <option value="" disabled>
            Select a unit
          </option>
          {(unitsQuery.data ?? []).map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.unitNumber}
            </option>
          ))}
        </select>
        {fieldErrors.unitId?.length ? (
          <p className="text-sm text-destructive">{fieldErrors.unitId[0]}</p>
        ) : null}
      </div>

      <Field
        id="walkin-name"
        name="visitorName"
        label="Visitor name"
        error={fieldErrors.visitorName}
      />
      <Field
        id="walkin-phone"
        name="visitorPhone"
        label="Phone number"
        error={fieldErrors.visitorPhone}
      />
      <Field
        id="walkin-purpose"
        name="purpose"
        label="Visit purpose"
        error={fieldErrors.purpose}
      />
      <Field
        id="walkin-expected"
        name="expectedAt"
        label="Expected date & time (optional)"
        type="datetime-local"
        error={fieldErrors.expectedAt}
      />
      <Field
        id="walkin-vehicle"
        name="vehicleNumber"
        label="Vehicle number (optional)"
        error={fieldErrors.vehicleNumber}
      />
      <div className="space-y-1.5">
        <label
          htmlFor="walkin-notes"
          className="block text-sm font-medium text-foreground"
        >
          Notes (optional)
        </label>
        <textarea
          id="walkin-notes"
          name="notes"
          rows={3}
          className={textareaClassName}
        />
      </div>

      <AuthStatus status={status} message={message} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Register walk-in"}
      </Button>
    </form>
  );
}
