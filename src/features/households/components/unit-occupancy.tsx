"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import Link from "next/link";
import { preservedSubmit } from "@/lib/form-submit";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/control";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import {
  createAdminHouseholdMember,
  deactivateHouseholdMember,
  fetchUnitHousehold,
} from "../api";
import { formatIndianPhone } from "@/lib/indian-phone";
import { HOUSEHOLD_RELATIONSHIPS } from "../types";
import { householdMemberFormSchema } from "../schemas";

type UnitOccupancyProps = {
  societyId: string;
  unitId: string;
};

export function UnitOccupancy({ societyId, unitId }: UnitOccupancyProps) {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const { pending, guard } = useSubmitGuard();
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["unit-household", societyId, unitId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchUnitHousehold(token, societyId, unitId);
    },
  });

  function refresh() {
    return queryClient.invalidateQueries({
      queryKey: ["unit-household", societyId, unitId],
    });
  }

  function onAdd(membershipId: string, formData: FormData, form: HTMLFormElement) {
    const parsed = householdMemberFormSchema.safeParse({
      name: formData.get("name"),
      relationship: formData.get("relationship"),
      phone: formData.get("phone") ?? "",
      email: formData.get("email") ?? "",
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the household member.");
      setMessage(undefined);
      return;
    }
    setError(undefined);
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        await createAdminHouseholdMember(token, societyId, {
          membershipId,
          ...parsed.data,
        });
        setMessage("Household member added.");
        form.reset();
        await refresh();
      } catch (caught) {
        setMessage(undefined);
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to add the household member.",
        );
      }
    });
  }

  function onDeactivate(memberId: string) {
    setError(undefined);
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        await deactivateHouseholdMember(token, memberId);
        setMessage("Household member deactivated.");
        await refresh();
      } catch (caught) {
        setMessage(undefined);
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Unable to deactivate the household member.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link
            href={`/societies/${societyId}/residents`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Resident directory
          </Link>
        </p>
        <h2 className="mt-3 text-lg font-semibold text-foreground">
          Unit occupancy
        </h2>
        {query.data ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {query.data.buildingName} · Unit {query.data.unitNumber}
          </p>
        ) : null}
      </div>

      {query.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading occupancy…
        </p>
      ) : null}
      {query.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {query.error instanceof ApiError
            ? query.error.message
            : "Unable to load unit occupancy."}
        </p>
      ) : null}
      {!query.isLoading &&
      !query.isError &&
      (query.data?.items.length ?? 0) === 0 ? (
        <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
          No active memberships have this unit as their primary home.
        </p>
      ) : null}

      {message ? (
        <p className="text-sm text-foreground" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {query.data?.items.map((item) => (
          <li
            key={item.membershipId}
            className="rounded-lg border border-border bg-card px-4 py-3"
          >
            <p className="text-sm font-medium text-foreground">
              {item.displayName}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {item.email ?? "No email"} · {item.role.replaceAll("_", " ")}
            </p>
            {item.householdMembers.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                No active household members.
              </p>
            ) : (
              <ul className="mt-2 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                {item.householdMembers.map((member) => (
                  <li key={member.id} className="flex items-center justify-between gap-2">
                    <span>
                      {member.name} · {member.relationship.replaceAll("_", " ")}
                      {member.phone ? ` · ${formatIndianPhone(member.phone)}` : ""}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => setDeactivateId(member.id)}
                    >
                      Deactivate
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <form
              className="mt-3 grid gap-2 border-t border-border pt-3 sm:grid-cols-2"
              noValidate onSubmit={preservedSubmit((formData, form) => onAdd(item.membershipId, formData, form))}
            >
              <input
                name="name"
                required
                placeholder="Household member name"
                aria-label="Household member name"
                className={controlClassName}
              />
              <select
                name="relationship"
                defaultValue="OTHER"
                aria-label="Relationship"
                className={controlClassName}
              >
                {HOUSEHOLD_RELATIONSHIPS.map((relationship) => (
                  <option key={relationship} value={relationship}>
                    {relationship.charAt(0) + relationship.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <input
                name="phone"
                placeholder="+91…"
                aria-label="Phone"
                className={controlClassName}
              />
              <input
                name="email"
                type="email"
                placeholder="Email (optional)"
                aria-label="Email"
                className={controlClassName}
              />
              <Button type="submit" size="sm" disabled={pending}>
                {pending ? "Saving…" : "Add household member"}
              </Button>
            </form>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={deactivateId !== null}
        title="Deactivate this household member?"
        description="They stay on the record as inactive and no longer appear in the active household."
        confirmLabel="Deactivate"
        pending={pending}
        onCancel={() => setDeactivateId(null)}
        onConfirm={() => {
          const memberId = deactivateId;
          setDeactivateId(null);
          if (memberId) onDeactivate(memberId);
        }}
      />
    </div>
  );
}
