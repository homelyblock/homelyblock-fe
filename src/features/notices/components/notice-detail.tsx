"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatStatus } from "@/components/ui/status-tone";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { formatDateTime } from "@/lib/format-date";
import { ApiError } from "@/services/api-client";
import {
  archiveNotice,
  deleteNotice,
  fetchNotice,
  fetchNoticeReadership,
  markNoticeRead,
  publishNotice,
} from "../api";

type NoticeDetailProps = {
  societyId: string;
  noticeId: string;
  canManage: boolean;
};

export function NoticeDetailView({
  societyId,
  noticeId,
  canManage,
}: NoticeDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const noticeQuery = useQuery({
    queryKey: ["notice", noticeId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchNotice(token, noticeId);
    },
  });

  const readershipQuery = useQuery({
    queryKey: ["notice-readership", noticeId],
    enabled: canManage && Boolean(noticeQuery.data),
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchNoticeReadership(token, noticeId);
    },
  });

  function runAction(
    action: () => Promise<unknown>,
    successMessage: string,
  ) {
    startTransition(async () => {
      try {
        await action();
        setStatus("success");
        setMessage(successMessage);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["notice", noticeId] }),
          queryClient.invalidateQueries({
            queryKey: ["notice-readership", noticeId],
          }),
          queryClient.invalidateQueries({ queryKey: ["notices", societyId] }),
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

  if (noticeQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading notice…
      </p>
    );
  }

  if (noticeQuery.isError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {noticeQuery.error instanceof ApiError
          ? noticeQuery.error.message
          : "Unable to load notice."}
      </p>
    );
  }

  const notice = noticeQuery.data;
  if (!notice) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-lg border border-border bg-card px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {formatStatus(notice.category)} · {formatStatus(notice.status)}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
              {notice.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Audience: {formatStatus(notice.audienceType)}
              {notice.isRead === false ? " · Unread" : ""}
              {notice.isRead ? " · Read" : ""}
            </p>
          </div>
          {canManage && notice.status === "DRAFT" ? (
            <Link
              href={`/societies/${societyId}/notices/${notice.id}/edit`}
              className="inline-flex h-8 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted/60"
            >
              Edit draft
            </Link>
          ) : null}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Published
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {formatDateTime(notice.publishedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Created by
            </dt>
            <dd className="mt-1 text-sm text-foreground">
              {notice.createdByDisplayName ?? "—"}
            </dd>
          </div>
        </dl>

        <div className="whitespace-pre-wrap text-sm leading-6 text-foreground">
          {notice.body}
        </div>
      </div>

      <div className="space-y-3">
        <AuthStatus status={status} message={message} />
        <div className="flex flex-wrap gap-2">
          {canManage && notice.status === "DRAFT" ? (
            <Button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(async () => {
                  const token = await getBrowserAccessToken();
                  if (!token) {
                    throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
                  }
                  await publishNotice(token, notice.id);
                }, "Notice published.")
              }
            >
              Publish
            </Button>
          ) : null}
          {canManage && notice.status === "DRAFT" ? (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirmDelete(true)}
            >
              Delete draft
            </Button>
          ) : null}
          {canManage && notice.status === "PUBLISHED" ? (
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() =>
                runAction(async () => {
                  const token = await getBrowserAccessToken();
                  if (!token) {
                    throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
                  }
                  await archiveNotice(token, notice.id);
                }, "Notice archived.")
              }
            >
              Archive
            </Button>
          ) : null}
          {notice.status === "PUBLISHED" && !notice.isRead ? (
            <Button
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() =>
                runAction(async () => {
                  const token = await getBrowserAccessToken();
                  if (!token) {
                    throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
                  }
                  await markNoticeRead(token, notice.id);
                }, "Marked as read.")
              }
            >
              Mark as read
            </Button>
          ) : null}
        </div>
      </div>

      {canManage ? (
        <div className="rounded-lg border border-border bg-card px-6 py-6">
          <h2 className="text-base font-semibold text-foreground">
            Readership
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Counts eligible active residents in the notice audience only.
          </p>
          {readershipQuery.isLoading ? (
            <p className="mt-4 text-sm text-muted-foreground" role="status">
              Loading readership…
            </p>
          ) : readershipQuery.isError ? (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {readershipQuery.error instanceof ApiError
                ? readershipQuery.error.message
                : "Unable to load readership."}
            </p>
          ) : readershipQuery.data ? (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Eligible residents
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {readershipQuery.data.eligibleRecipients}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Read
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {readershipQuery.data.readCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Unread
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {readershipQuery.data.unreadCount}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Read percentage
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {readershipQuery.data.readPercentage}%
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmDelete}
        title="Delete this draft?"
        description="The draft is removed and cannot be published later."
        confirmLabel="Delete draft"
        pending={pending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          runAction(async () => {
            const token = await getBrowserAccessToken();
            if (!token) {
              throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
            }
            await deleteNotice(token, notice.id);
            router.push(`/societies/${societyId}/notices`);
          }, "Draft deleted.");
        }}
      />
    </div>
  );
}
