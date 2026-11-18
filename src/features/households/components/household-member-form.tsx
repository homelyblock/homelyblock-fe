"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/control";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import {
  createOwnHouseholdMember,
  deactivateHouseholdMember,
  updateHouseholdMember,
} from "../api";
import { householdMemberFormSchema } from "../schemas";
import {
  HOUSEHOLD_RELATIONSHIPS,
  type HouseholdMember,
} from "../types";

type HouseholdMemberFormProps = {
  societyId: string;
  member?: HouseholdMember;
};

export function HouseholdMemberForm({
  societyId,
  member,
}: HouseholdMemberFormProps) {
  const router = useRouter();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData) {
    const parsed = householdMemberFormSchema.safeParse({
      name: formData.get("name"),
      relationship: formData.get("relationship"),
      phone: formData.get("phone") ?? "",
      email: formData.get("email") ?? "",
    });

    if (!parsed.success) {
      const next: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        if (value?.length) next[key] = value;
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
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        if (member) {
          await updateHouseholdMember(token, member.id, {
            name: parsed.data.name,
            relationship: parsed.data.relationship,
            phone: parsed.data.phone ?? null,
            email: parsed.data.email ?? null,
          });
        } else {
          await createOwnHouseholdMember(token, societyId, {
            name: parsed.data.name,
            relationship: parsed.data.relationship,
            ...(parsed.data.phone ? { phone: parsed.data.phone } : {}),
            ...(parsed.data.email ? { email: parsed.data.email } : {}),
          });
        }
        setStatus("success");
        setMessage(member ? "Member updated." : "Member added.");
        router.push(`/societies/${societyId}/household`);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to save household member.",
        );
      }
    });
  }

  function onDeactivate() {
    if (!member) return;
    setConfirmDeactivate(false);
    startTransition(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        await deactivateHouseholdMember(token, member.id);
        setStatus("success");
        setMessage("Member deactivated.");
        router.push(`/societies/${societyId}/household`);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to deactivate member.",
        );
      }
    });
  }

  return (
    <>
    <form action={onSubmit} className="space-y-4">
      <Field
        id="name"
        name="name"
        label="Name"
        defaultValue={member?.name ?? ""}
        error={fieldErrors.name}
        required
      />
      <div className="space-y-1.5">
        <label
          htmlFor="relationship"
          className="block text-sm font-medium text-foreground"
        >
          Relationship
        </label>
        <select
          id="relationship"
          name="relationship"
          defaultValue={member?.relationship ?? "OTHER"}
          className={controlClassName}
          aria-invalid={Boolean(fieldErrors.relationship?.length)}
        >
          {HOUSEHOLD_RELATIONSHIPS.map((value) => (
            <option key={value} value={value}>
              {value.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        {fieldErrors.relationship?.length ? (
          <p className="text-sm text-destructive">{fieldErrors.relationship[0]}</p>
        ) : null}
      </div>
      <Field
        id="phone"
        name="phone"
        label="Phone (optional)"
        defaultValue={member?.phone ?? ""}
        error={fieldErrors.phone}
      />
      <Field
        id="email"
        name="email"
        label="Email (optional)"
        type="email"
        defaultValue={member?.email ?? ""}
        error={fieldErrors.email}
      />
      <AuthStatus status={status} message={message} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : member ? "Save changes" : "Add member"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push(`/societies/${societyId}/household`)}
        >
          Cancel
        </Button>
        {member?.isActive ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setConfirmDeactivate(true)}
          >
            Deactivate
          </Button>
        ) : null}
      </div>
    </form>
    <ConfirmDialog
      open={confirmDeactivate}
      title={member ? `Deactivate ${member.name}?` : "Deactivate member?"}
      description="They will be hidden from active occupancy."
      confirmLabel="Deactivate"
      pending={pending}
      onCancel={() => setConfirmDeactivate(false)}
      onConfirm={onDeactivate}
    />
    </>
  );
}
