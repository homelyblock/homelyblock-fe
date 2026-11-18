"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/control";
import { Field } from "@/features/auth/components/field";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { updateSociety } from "../api";
import type { SocietyDetail, SocietyStatus } from "../types";

type EditSocietyFormProps = {
  society: SocietyDetail;
};

export function EditSocietyForm({ society }: EditSocietyFormProps) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();

  function onSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (name.length < 2) {
      setStatus("error");
      setMessage("Name must be at least 2 characters.");
      return;
    }

    startTransition(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }

        await updateSociety(token, society.id, {
          name,
          addressLine1: String(formData.get("addressLine1") ?? "").trim() || null,
          addressLine2: String(formData.get("addressLine2") ?? "").trim() || null,
          city: String(formData.get("city") ?? "").trim() || null,
          state: String(formData.get("state") ?? "").trim() || null,
          postalCode: String(formData.get("postalCode") ?? "").trim() || null,
          status: String(formData.get("status")) as SocietyStatus,
        });

        setStatus("success");
        setMessage("Society updated.");
        await queryClient.invalidateQueries({
          queryKey: ["society", society.id],
        });
        await queryClient.invalidateQueries({ queryKey: ["societies"] });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to update the society.",
        );
      }
    });
  }

  if (!("addressLine1" in society)) {
    return null;
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Edit society</h2>
      <AuthStatus status={status} message={message} />
      <Field
        id="edit-name"
        name="name"
        label="Society name"
        defaultValue={society.name}
        required
      />
      <Field
        id="edit-addressLine1"
        name="addressLine1"
        label="Address line 1"
        defaultValue={society.addressLine1 ?? ""}
      />
      <Field
        id="edit-addressLine2"
        name="addressLine2"
        label="Address line 2"
        defaultValue={society.addressLine2 ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          id="edit-city"
          name="city"
          label="City"
          defaultValue={society.city ?? ""}
        />
        <Field
          id="edit-state"
          name="state"
          label="State"
          defaultValue={society.state ?? ""}
        />
        <Field
          id="edit-postalCode"
          name="postalCode"
          label="Postal code"
          defaultValue={society.postalCode ?? ""}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="edit-status" className="block text-sm font-medium text-foreground">
          Status
        </label>
        <select
          id="edit-status"
          name="status"
          defaultValue={society.status}
          className={controlClassName}
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="ARCHIVED">ARCHIVED</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
