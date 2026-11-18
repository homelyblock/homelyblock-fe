"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/features/auth/components/field";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { createSociety } from "../api";
import { createSocietySchema } from "../schemas";
import type { UserSearchItem } from "../types";
import { UserSearchSelector } from "./user-search-selector";

export function CreateSocietyForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [selectedAdmin, setSelectedAdmin] = useState<UserSearchItem | null>(
    null,
  );

  function onSubmit(formData: FormData) {
    const parsed = createSocietySchema.safeParse({
      name: formData.get("name"),
      addressLine1: formData.get("addressLine1") || "",
      addressLine2: formData.get("addressLine2") || "",
      city: formData.get("city") || "",
      state: formData.get("state") || "",
      postalCode: formData.get("postalCode") || "",
      initialAdminUserId: selectedAdmin?.id ?? "",
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const next: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(flattened)) {
        if (value && value.length > 0) {
          next[key] = value;
        }
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

        const payload = {
          name: parsed.data.name,
          initialAdminUserId: parsed.data.initialAdminUserId,
          ...(parsed.data.addressLine1
            ? { addressLine1: parsed.data.addressLine1 }
            : {}),
          ...(parsed.data.addressLine2
            ? { addressLine2: parsed.data.addressLine2 }
            : {}),
          ...(parsed.data.city ? { city: parsed.data.city } : {}),
          ...(parsed.data.state ? { state: parsed.data.state } : {}),
          ...(parsed.data.postalCode
            ? { postalCode: parsed.data.postalCode }
            : {}),
        };

        const result = await createSociety(token, payload);
        setStatus("success");
        setMessage("Society created.");
        router.push(`/societies/${result.society.id}`);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to create the society.",
        );
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <AuthStatus status={status} message={message} />
      <Field
        id="name"
        name="name"
        label="Society name"
        required
        error={fieldErrors.name}
      />
      <Field
        id="addressLine1"
        name="addressLine1"
        label="Address line 1"
        error={fieldErrors.addressLine1}
      />
      <Field
        id="addressLine2"
        name="addressLine2"
        label="Address line 2"
        error={fieldErrors.addressLine2}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="city" name="city" label="City" error={fieldErrors.city} />
        <Field id="state" name="state" label="State" error={fieldErrors.state} />
        <Field
          id="postalCode"
          name="postalCode"
          label="Postal code"
          error={fieldErrors.postalCode}
        />
      </div>
      <UserSearchSelector
        canSearch
        selected={selectedAdmin}
        onSelect={setSelectedAdmin}
        error={fieldErrors.initialAdminUserId}
      />
      <p className="text-xs leading-5 text-muted-foreground">
        Search requires an existing LivingSpace profile (after the admin has
        signed in at least once). Platform-owner authorization is enforced by
        the API.
      </p>
      <Button type="submit" disabled={pending || !selectedAdmin}>
        {pending ? "Creating…" : "Create society"}
      </Button>
    </form>
  );
}
