"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatStatus } from "@/components/ui/status-tone";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { formatDateTime } from "@/lib/format-date";
import { formatIndianPhone } from "@/lib/indian-phone";
import { ApiError } from "@/services/api-client";
import {
  approveVisitor,
  cancelVisitor,
  checkInVisitor,
  checkOutVisitor,
  fetchVisitor,
  rejectVisitor,
} from "../api";

type VisitorDetailProps = {
  societyId: string;
  visitorId: string;
  canManage: boolean;
  currentUserId: string;
  residentUnitId?: string | null;
};

export function VisitorDetailView({
  societyId,
  visitorId,
  canManage,
  currentUserId,
  residentUnitId = null,
}: VisitorDetailProps) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [pendingConfirm, setPendingConfirm] = useState<{
    title: string;
    successMessage: string;
    action: () => Promise<unknown>;
    tone: "default" | "danger";
  } | null>(null);

  const query = useQuery({
    queryKey: ["visitor", visitorId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchVisitor(token, visitorId);
    },
  });

  function runAction(
    action: () => Promise<unknown>,
    successMessage: string,
    confirmMessage?: string,
    tone: "default" | "danger" = "danger",
  ) {
    if (confirmMessage) {
      setPendingConfirm({ title: confirmMessage, successMessage, action, tone });
      return;
    }
    execute(action, successMessage);
  }

  function execute(action: () => Promise<unknown>, successMessage: string) {
    startTransition(async () => {
      try {
        await action();
        setStatus("success");
        setMessage(successMessage);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["visitor", visitorId] }),
          queryClient.invalidateQueries({ queryKey: ["visitors", societyId] }),
        ]);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to complete that action.",
        );
      }
    });
  }

  if (query.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading visitor…
      </p>
    );
  }

  if (query.isError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {query.error instanceof ApiError
          ? query.error.message
          : "Unable to load visitor."}
      </p>
    );
  }

  const visitor = query.data;
  if (!visitor) return null;

  const canDecide =
    visitor.status === "PENDING" &&
    residentUnitId !== null &&
    visitor.unitId === residentUnitId;
  const canCancel =
    (visitor.status === "PENDING" || visitor.status === "APPROVED") &&
    (canManage || visitor.createdByUserId === currentUserId);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border border-border bg-card px-6 py-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {formatStatus(visitor.entryType)} · {formatStatus(visitor.status)}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {visitor.visitorName}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{visitor.purpose}</p>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Phone
            </dt>
            <dd className="mt-1 text-sm text-foreground">{formatIndianPhone(visitor.visitorPhone)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Unit
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {visitor.buildingCode ? `${visitor.buildingCode} · ` : ""}
              {visitor.unitNumber ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Expected
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDateTime(visitor.expectedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Vehicle
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {visitor.vehicleNumber ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Checked in
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDateTime(visitor.checkedInAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Checked out
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDateTime(visitor.checkedOutAt)}
            </dd>
          </div>
        </dl>

        {visitor.notes ? (
          <p className="text-sm text-foreground whitespace-pre-wrap">
            {visitor.notes}
          </p>
        ) : null}
      </div>

      <div className="space-y-3">
        <AuthStatus status={status} message={message} />
        <div className="flex flex-wrap gap-2">
          {canDecide ? (
            <>
              <Button
                type="button"
                disabled={pending}
                onClick={() =>
                  runAction(
                    async () => {
                      const token = await getBrowserAccessToken();
                      if (!token) {
                        throw new ApiError(
                          "Sign in required",
                          401,
                          "UNAUTHORIZED",
                        );
                      }
                      await approveVisitor(token, visitor.id);
                    },
                    "Visitor approved.",
                    "Approve this visitor request?",
                    "default",
                  )
                }
              >
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  runAction(
                    async () => {
                      const token = await getBrowserAccessToken();
                      if (!token) {
                        throw new ApiError(
                          "Sign in required",
                          401,
                          "UNAUTHORIZED",
                        );
                      }
                      await rejectVisitor(token, visitor.id);
                    },
                    "Visitor rejected.",
                    "Reject this visitor request?",
                  )
                }
              >
                Reject
              </Button>
            </>
          ) : null}

          {canManage && visitor.status === "APPROVED" ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(async () => {
                  const token = await getBrowserAccessToken();
                  if (!token) {
                    throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
                  }
                  await checkInVisitor(token, visitor.id);
                }, "Visitor checked in.")
              }
            >
              Check in
            </Button>
          ) : null}

          {canManage && visitor.status === "CHECKED_IN" ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(async () => {
                  const token = await getBrowserAccessToken();
                  if (!token) {
                    throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
                  }
                  await checkOutVisitor(token, visitor.id);
                }, "Visitor checked out.")
              }
            >
              Check out
            </Button>
          ) : null}

          {canCancel ? (
            <Button
              type="button"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                runAction(
                  async () => {
                    const token = await getBrowserAccessToken();
                    if (!token) {
                      throw new ApiError(
                        "Sign in required",
                        401,
                        "UNAUTHORIZED",
                      );
                    }
                    await cancelVisitor(token, visitor.id);
                  },
                  "Visitor cancelled.",
                  "Cancel this visitor request?",
                )
              }
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>
      <ConfirmDialog
        open={pendingConfirm !== null}
        title={pendingConfirm?.title ?? "Confirm"}
        confirmLabel="Confirm"
        tone={pendingConfirm?.tone ?? "default"}
        pending={pending}
        onCancel={() => setPendingConfirm(null)}
        onConfirm={() => {
          const current = pendingConfirm;
          setPendingConfirm(null);
          if (!current) return;
          execute(current.action, current.successMessage);
        }}
      />
    </div>
  );
}
