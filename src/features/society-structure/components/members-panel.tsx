"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { preservedSubmit } from "@/lib/form-submit";
import { useRef, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptionSearch } from "@/components/ui/option-search";
import { ListPager } from "@/components/ui/list-pager";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { controlClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
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
  const { t, intl } = useI18n();
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
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");

  const membersQuery = useQuery({
    queryKey: ["members", societyId, page, submittedSearch],
    enabled: canManage,
    placeholderData: (previous) => previous,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchMembers(token, societyId, {
        page,
        limit: 25,
        ...(submittedSearch ? { q: submittedSearch } : {}),
      });
    },
  });

  const activeMembersQuery = useQuery({
    queryKey: ["members", societyId, "active-admins"],
    enabled: canManage,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchMembers(token, societyId, {
        status: "ACTIVE",
        role: "SOCIETY_ADMIN",
        limit: 100,
      });
    },
  });

  const unitsQuery = useQuery({
    queryKey: ["units", societyId, "options", unitSearch],
    enabled: canManage,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchUnits(token, societyId, {
        limit: 100,
        ...(unitSearch.trim() ? { q: unitSearch.trim() } : {}),
      });
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
        setMessage(t("common.checkFields"));
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
        setMessage(t("feedback.invitationCreated"));
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
            : t("directory.createFailed"),
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
        setMessage(t("common.checkFields"));
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
        setMessage(t("feedback.membershipUpdated"));
        setEditing(null);
        await queryClient.invalidateQueries({
          queryKey: ["members", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : t("directory.updateFailed"),
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
        {t("members.loading")}
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
          : t("members.loadError")}
      </p>
    );
  }

  const members = membersQuery.data?.items ?? [];
  const units = unitsQuery.data?.items ?? [];
  const activeAdmins = activeMembersQuery.data?.items ?? [];
  const activeAdminCount = activeMembersQuery.data?.total ?? activeAdmins.length;
  const protectsLastAdmin =
    editing !== null &&
    editing.role === "SOCIETY_ADMIN" &&
    editing.status === "ACTIVE" &&
    activeAdminCount <= 1;
  const soleAdminId =
    activeAdminCount === 1
      ? activeAdmins.find((member) => member.role === "SOCIETY_ADMIN")?.id
      : undefined;

  function confirmSuspend() {
    const member = suspendTarget;
    if (!member || pending || suspendLock.current) return;
    suspendLock.current = true;
    setSuspendError(undefined);
    const started = guard(async () => {
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
        setMessage(t("directory.suspended", { name: member.displayName }));
        setEditing(null);
        await queryClient.invalidateQueries({
          queryKey: ["members", societyId],
        });
      } catch (error) {
        setSuspendError(
          error instanceof ApiError
            ? error.message
            : t("directory.suspendFailed"),
        );
      } finally {
        suspendLock.current = false;
      }
    });
    if (!started) suspendLock.current = false;
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
        setMessage(t("directory.activated"));
        setEditing(null);
        await queryClient.invalidateQueries({
          queryKey: ["members", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : t("directory.updateFailed"),
        );
      }
    });
  }

  function reissue(memberId: string) {
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError(t("common.signInRequired"), 401, "UNAUTHORIZED");
        }
        await updateMembership(token, memberId, { reissue: true });
        setStatus("success");
        setMessage(t("directory.reissued"));
        await queryClient.invalidateQueries({ queryKey: ["members", societyId] });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError ? error.message : t("directory.updateFailed"),
        );
      }
    });
  }

  function revoke(memberId: string) {
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError(t("common.signInRequired"), 401, "UNAUTHORIZED");
        }
        await updateMembership(token, memberId, { status: "REMOVED" });
        setStatus("success");
        setMessage(t("directory.revoked"));
        setEditing(null);
        await queryClient.invalidateQueries({ queryKey: ["members", societyId] });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError ? error.message : t("directory.updateFailed"),
        );
      }
    });
  }

  function inviteDate(value?: string | null) {
    if (!value) return "";
    return new Intl.DateTimeFormat(intl, { dateStyle: "medium" }).format(
      new Date(value),
    );
  }

  return (
    <div className="space-y-6">
      <AuthStatus status={status} message={message} />
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("members.title")}</h2>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSubmittedSearch(search.trim());
          }}
        >
          <label className="sr-only" htmlFor="member-list-search">
            {t("directory.searchMembers")}
          </label>
          <input
            id="member-list-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("directory.searchMembers")}
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
          />
          <Button type="submit" variant="outline">
            {t("directory.search")}
          </Button>
        </form>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("members.empty")}</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
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
                    <StatusBadge
                      value={
                        member.invitationState === "EXPIRED"
                          ? "EXPIRED"
                          : member.status
                      }
                    />
                    {member.invitationState === "EXPIRED" ? (
                      <span>{t("directory.expiredOn", { date: inviteDate(member.invitationExpiresAt) })}</span>
                    ) : null}
                    {member.invitationState === "PENDING" ? (
                      <span>{t("directory.expiresOn", { date: inviteDate(member.invitationExpiresAt) })}</span>
                    ) : null}
                  </p>
                </div>
                {canManage ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {member.invitationState === "PENDING" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        onClick={() => changeStatus(member.id, "ACTIVE")}
                      >
                        {t("members.activate")}
                      </Button>
                    ) : null}
                    {member.invitationState === "EXPIRED" || member.status === "REMOVED" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        onClick={() => reissue(member.id)}
                      >
                        {t("directory.reissue")}
                      </Button>
                    ) : null}
                    {member.invitationState === "PENDING" ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => revoke(member.id)}
                      >
                        {t("directory.revoke")}
                      </Button>
                    ) : null}
                    {member.status === "SUSPENDED" || member.status === "REMOVED" ? (
                      <Button
                        type="button"
                        size="sm"
                        disabled={pending}
                        onClick={() => changeStatus(member.id, "ACTIVE")}
                      >
                        {t("members.restore")}
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
                        {t("members.suspend")}
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
                      {t("common.edit")}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <ListPager
          page={page}
          pageSize={membersQuery.data?.limit ?? 25}
          total={membersQuery.data?.total ?? 0}
          disabled={membersQuery.isFetching}
          onPage={setPage}
        />
      </div>

      {canManage && !editing ? (
        <form
          noValidate onSubmit={preservedSubmit(onCreate)}
          className="space-y-4 rounded-lg border border-border bg-card px-5 py-5"
        >
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {t("members.add")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("directory.inviteHelp", {
                days: membersQuery.data?.invitationTtlDays ?? 14,
              })}
            </p>
          </div>

          <UserSearchSelector
            label={t("forms.registeredUser")}
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
              {t("members.role")}
            </label>
            <select
              id="member-role"
              name="role"
              defaultValue="RESIDENT_USER"
              className={controlClassName}
            >
              <option value="RESIDENT_USER">{t("members.resident")}</option>
              <option value="SOCIETY_ADMIN">{t("members.admin")}</option>
            </select>
            <p className="text-xs text-muted-foreground">
              {t("directory.roleHint")}
            </p>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="member-unit"
              className="block text-sm font-medium text-foreground"
            >
              {t("directory.primaryUnitOptional")}
            </label>
            <OptionSearch
              id="member-unit-search"
              label={t("work.findUnit")}
              value={unitSearch}
              onChange={setUnitSearch}
              total={unitsQuery.data?.total}
              shown={units.length}
            />
            <select
              id="member-unit"
              name="primaryUnitId"
              defaultValue=""
              className={controlClassName}
            >
              <option value="">{t("directory.none")}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber}
                </option>
              ))}
            </select>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? t("members.inviting") : t("members.invite")}
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
              {t("directory.editMembership")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {editing.displayName}
              {editing.email ? ` · ${editing.email}` : ""}
            </p>
            {protectsLastAdmin ? (
              <p className="mt-2 text-sm text-muted-foreground">
                {t("directory.lastAdmin")}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-member-role"
                className="block text-sm font-medium text-foreground"
              >
                {t("members.role")}
              </label>
              <select
                id="edit-member-role"
                name="role"
                defaultValue={editing.role}
                className={controlClassName}
              >
                <option value="RESIDENT_USER" disabled={protectsLastAdmin}>
                  {t("members.resident")}
                </option>
                <option value="SOCIETY_ADMIN">{t("members.admin")}</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="edit-member-status"
                className="block text-sm font-medium text-foreground"
              >
                {t("directory.status")}
              </label>
              <select
                id="edit-member-status"
                name="status"
                defaultValue={editing.status}
                className={controlClassName}
              >
                <option value="INVITED" disabled={protectsLastAdmin}>
                  {t("status.INVITED")}
                </option>
                <option value="ACTIVE">{t("status.ACTIVE")}</option>
                <option value="SUSPENDED" disabled={protectsLastAdmin}>
                  {t("status.SUSPENDED")}
                </option>
                <option value="REMOVED" disabled={protectsLastAdmin}>
                  {t("status.REMOVED")}
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-member-unit"
              className="block text-sm font-medium text-foreground"
            >
              {t("directory.primaryUnit")}
            </label>
            <OptionSearch
              id="edit-member-unit-search"
              label={t("work.findUnit")}
              value={unitSearch}
              onChange={setUnitSearch}
              total={unitsQuery.data?.total}
              shown={units.length}
            />
            <select
              id="edit-member-unit"
              name="primaryUnitId"
              defaultValue={editing.primaryUnitId ?? ""}
              className={controlClassName}
            >
              <option value="">{t("directory.none")}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? t("common.saving") : t("directory.updateMembership")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() => setEditing(null)}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      ) : null}
      <ConfirmDialog
        open={suspendTarget !== null}
        title={
          suspendTarget
            ? t("directory.suspendTitle", { name: suspendTarget.displayName })
            : t("directory.suspendConfirm")
        }
        description={
          suspendTarget
            ? t("directory.suspendBody", {
                who: suspendTarget.email ?? suspendTarget.displayName,
              })
            : undefined
        }
        confirmLabel={t("directory.suspendConfirm")}
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
