"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { preservedSubmit } from "@/lib/form-submit";
import { useRef, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { controlClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { UserSearchSelector } from "@/features/societies/components/user-search-selector";
import type { UserSearchItem } from "@/features/societies/types";
import { ApiError } from "@/services/api-client";
import {
  createMembership,
  fetchMembers,
  fetchUnits,
  updateMembership,
} from "../api";
import { createMembershipSchema, updateMembershipSchema } from "../schemas";
import type { Membership } from "../types";

type MembersPanelProps = {
  societyId: string;
  canManage: boolean;
};

export function MembersPanel({ societyId, canManage }: MembersPanelProps) {
  const queryClient = useQueryClient();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [selectedUser, setSelectedUser] = useState<UserSearchItem | null>(null);
  const [editing, setEditing] = useState<Membership | null>(null);
  const [suspendTarget, setSuspendTarget] = useState<Membership | null>(null);
  const [suspendUpdate, setSuspendUpdate] = useState<{
    role: "SOCIETY_ADMIN" | "RESIDENT_USER";
    status: "SUSPENDED";
    primaryUnitId: string | null;
  } | null>(null);
  const [suspendError, setSuspendError] = useState<string | undefined>();
  const suspendLock = useRef(false);

  const membersQuery = useQuery({
    queryKey: ["members", societyId],
    enabled: canManage,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchMembers(token, societyId);
    },
  });

  const unitsQuery = useQuery({
    queryKey: ["units", societyId, "all"],
    enabled: canManage,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchUnits(token, societyId);
    },
  });

  function onCreate(formData: FormData, form: HTMLFormElement) {
    const parsed = createMembershipSchema.safeParse({
      userId: selectedUser?.id ?? "",
      role: formData.get("role"),
      status: "INVITED",
      primaryUnitId: formData.get("primaryUnitId") || "",
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
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }

        await createMembership(token, societyId, {
          userId: parsed.data.userId,
          role: parsed.data.role,
          status: parsed.data.status,
          ...(parsed.data.primaryUnitId
            ? { primaryUnitId: parsed.data.primaryUnitId }
            : {}),
        });
        setStatus("success");
        setMessage(
          "Invitation created. They can see it after signing in, and they cannot open the society until you activate the membership.",
        );
        setSelectedUser(null);
        form.reset();
        await queryClient.invalidateQueries({
          queryKey: ["members", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to create membership.",
        );
      }
    });
  }

  function onUpdate(formData: FormData) {
    if (!editing) {
      return;
    }

    const parsed = updateMembershipSchema.safeParse({
      role: formData.get("role"),
      status: formData.get("status"),
      primaryUnitId: formData.get("primaryUnitId") || "",
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

    const payload = {
      role: parsed.data.role,
      status: parsed.data.status,
      primaryUnitId: parsed.data.primaryUnitId
        ? parsed.data.primaryUnitId
        : null,
    };
    if (editing.status === "ACTIVE" && payload.status === "SUSPENDED") {
      setFieldErrors({});
      setSuspendError(undefined);
      setSuspendUpdate({ ...payload, status: "SUSPENDED" });
      setSuspendTarget(editing);
      return;
    }

    setFieldErrors({});
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }

        await updateMembership(token, editing.id, payload);
        setStatus("success");
        setMessage("Membership updated.");
        setEditing(null);
        await queryClient.invalidateQueries({
          queryKey: ["members", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to update membership.",
        );
      }
    });
  }

  if (!canManage) {
    return null;
  }

  if (membersQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading members…
      </p>
    );
  }

  if (membersQuery.isError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {membersQuery.error instanceof ApiError
          ? membersQuery.error.message
          : "Unable to load members."}
      </p>
    );
  }

  const members = membersQuery.data ?? [];
  const units = unitsQuery.data ?? [];
  const activeAdminCount = members.filter(
    (member) => member.role === "SOCIETY_ADMIN" && member.status === "ACTIVE",
  ).length;
  const protectsLastAdmin =
    editing !== null &&
    editing.role === "SOCIETY_ADMIN" &&
    editing.status === "ACTIVE" &&
    activeAdminCount <= 1;
  const soleAdminId =
    activeAdminCount === 1
      ? members.find(
          (member) =>
            member.role === "SOCIETY_ADMIN" && member.status === "ACTIVE",
        )?.id
      : undefined;

  function confirmSuspend() {
    const member = suspendTarget;
    if (!member || pending || suspendLock.current) return;
    suspendLock.current = true;
    setSuspendError(undefined);
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        await updateMembership(
          token,
          member.id,
          suspendUpdate ?? { status: "SUSPENDED" },
        );
        setSuspendTarget(null);
        setSuspendUpdate(null);
        setStatus("success");
        setMessage(
          `${member.displayName} is suspended and can no longer open this society.`,
        );
        setEditing(null);
        await queryClient.invalidateQueries({
          queryKey: ["members", societyId],
        });
      } catch (error) {
        setSuspendError(
          error instanceof ApiError
            ? error.message
            : "Unable to suspend this membership.",
        );
      } finally {
        suspendLock.current = false;
      }
    });
  }

  function changeStatus(memberId: string, status: "ACTIVE") {
    setFieldErrors({});
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        await updateMembership(token, memberId, { status });
        setStatus("success");
        setMessage(
          "Membership activated. They can open the society the next time they sign in.",
        );
        setEditing(null);
        await queryClient.invalidateQueries({
          queryKey: ["members", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to update membership.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <AuthStatus status={status} message={message} />
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No memberships yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.displayName}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    {member.email ? <span>{member.email}</span> : null}
                    <StatusBadge value={member.role} />
                    <StatusBadge value={member.status} />
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {member.status === "INVITED" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        onClick={() => changeStatus(member.id, "ACTIVE")}
                      >
                        Activate
                      </Button>
                    ) : null}
                    {member.status === "SUSPENDED" || member.status === "REMOVED" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        onClick={() => changeStatus(member.id, "ACTIVE")}
                      >
                        Restore access
                      </Button>
                    ) : null}
                    {member.status === "ACTIVE" && member.id !== soleAdminId ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          setSuspendError(undefined);
                          setSuspendTarget(member);
                        }}
                      >
                        Suspend
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => {
                        setEditing(member);
                        setStatus("idle");
                        setMessage(undefined);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage && !editing ? (
        <form
          noValidate onSubmit={preservedSubmit(onCreate)}
          className="space-y-4 rounded-lg border border-border bg-card px-5 py-5"
        >
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Add member
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Search members of this society by name or email. To invite
              someone who already has an account but no society, enter their
              full email address. The membership starts as invited and does
              not grant access until you activate it. Platform roles cannot
              be assigned here.
            </p>
          </div>

          <UserSearchSelector
            label="Registered user"
            inputId="member-search"
            societyId={societyId}
            canSearch={canManage}
            selected={selectedUser}
            onSelect={setSelectedUser}
            error={fieldErrors.userId}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="member-role"
              className="block text-sm font-medium text-foreground"
            >
              Role
            </label>
            <select
              id="member-role"
              name="role"
              defaultValue="RESIDENT_USER"
              className={controlClassName}
            >
              <option value="RESIDENT_USER">Resident</option>
              <option value="SOCIETY_ADMIN">Society admin</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Either role is invited first. Activate it from the list when the person should be able to open the society.
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="member-unit"
              className="block text-sm font-medium text-foreground"
            >
              Primary unit (optional)
            </label>
            <select
              id="member-unit"
              name="primaryUnitId"
              defaultValue=""
              className={controlClassName}
            >
              <option value="">None</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Create invitation"}
          </Button>
        </form>
      ) : null}

      {canManage && editing ? (
        <form
          noValidate onSubmit={preservedSubmit(onUpdate)}
          className="space-y-4 rounded-lg border border-border bg-card px-5 py-5"
          key={editing.id}
        >
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Edit membership
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {editing.displayName}
              {editing.email ? ` · ${editing.email}` : ""}
            </p>
            {protectsLastAdmin ? (
              <p className="mt-2 text-sm text-muted-foreground">
                This society must keep at least one active society
                administrator. Add another active administrator before changing
                this role or status. The primary flat can still be updated.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-member-role"
                className="block text-sm font-medium text-foreground"
              >
                Role
              </label>
              <select
                id="edit-member-role"
                name="role"
                defaultValue={editing.role}
                className={controlClassName}
              >
                <option value="RESIDENT_USER" disabled={protectsLastAdmin}>
                  RESIDENT_USER
                </option>
                <option value="SOCIETY_ADMIN">SOCIETY_ADMIN</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="edit-member-status"
                className="block text-sm font-medium text-foreground"
              >
                Status
              </label>
              <select
                id="edit-member-status"
                name="status"
                defaultValue={editing.status}
                className={controlClassName}
              >
                <option value="INVITED" disabled={protectsLastAdmin}>
                  INVITED
                </option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED" disabled={protectsLastAdmin}>
                  SUSPENDED
                </option>
                <option value="REMOVED" disabled={protectsLastAdmin}>
                  REMOVED
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-member-unit"
              className="block text-sm font-medium text-foreground"
            >
              Primary unit
            </label>
            <select
              id="edit-member-unit"
              name="primaryUnitId"
              defaultValue={editing.primaryUnitId ?? ""}
              className={controlClassName}
            >
              <option value="">None</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Update membership"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setEditing(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
      <ConfirmDialog
        open={suspendTarget !== null}
        title={
          suspendTarget
            ? `Suspend ${suspendTarget.displayName}?`
            : "Suspend membership?"
        }
        description={
          suspendTarget
            ? `${suspendTarget.email ? `${suspendTarget.email} loses` : "This person loses"} access to this society until an administrator restores the membership. The account and its history stay in place.`
            : undefined
        }
        confirmLabel="Suspend membership"
        pending={pending}
        error={suspendError}
        onCancel={() => {
          if (pending) return;
          setSuspendTarget(null);
          setSuspendUpdate(null);
          setSuspendError(undefined);
        }}
        onConfirm={confirmSuspend}
      />
    </div>
  );
}
