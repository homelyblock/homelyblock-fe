"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { preservedSubmit } from "@/lib/form-submit";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatStatus } from "@/components/ui/status-tone";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { formatDateTime } from "@/lib/format-date";
import { textareaClassName } from "@/components/ui/control";
import { WrongSocietyNotice, wrongSocietyHref } from "@/features/shell/wrong-society";
import { ApiError } from "@/services/api-client";
import {
  acknowledgeComplaint,
  addComplaintComment,
  assignComplaint,
  closeComplaint,
  downloadComplaintAttachment,
  fetchComplaint,
  reopenComplaint,
  resolveComplaint,
  startComplaint,
  uploadComplaintAttachment,
} from "../api";

type ComplaintDetailViewProps = {
  societyId: string;
  complaintId: string;
  canManage: boolean;
  currentUserId: string;
};

export function ComplaintDetailView({
  societyId,
  complaintId,
  canManage,
  currentUserId,
}: ComplaintDetailViewProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();

  const query = useQuery({
    queryKey: ["complaint", complaintId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchComplaint(token, complaintId);
    },
  });

  function refresh() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["complaint", complaintId] }),
      queryClient.invalidateQueries({ queryKey: ["complaints", societyId] }),
      queryClient.invalidateQueries({
        queryKey: ["complaints-dashboard", societyId],
      }),
    ]);
  }

  function run(action: () => Promise<unknown>, successMessage: string) {
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        await action();
        setStatus("success");
        setMessage(successMessage);
        await refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError ? error.message : "Action failed.",
        );
      }
    });
  }

  if (query.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading complaint…
      </p>
    );
  }
  if (query.isError || !query.data) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {query.error instanceof ApiError
          ? query.error.message
          : "Unable to load complaint."}
      </p>
    );
  }

  const complaint = query.data;
  if (complaint.societyId !== societyId) {
    return (
      <WrongSocietyNotice
        href={wrongSocietyHref(
          complaint.societyId,
          `/complaints/${complaint.id}`,
        )}
      />
    );
  }
  const isOwner = complaint.createdByUserId === currentUserId;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {complaint.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatStatus(complaint.category)} · {complaint.buildingCode}-{complaint.unitNumber}{" "}
            · {formatDateTime(complaint.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={complaint.priority} />
          <StatusBadge value={complaint.status} />
        </div>
      </div>

      <AuthStatus status={status} message={message} />

      <article className="space-y-3 rounded-lg border border-border bg-card p-4">
        <p className="text-sm whitespace-pre-wrap text-foreground">
          {complaint.description}
        </p>
        {complaint.assignedToDisplayName ? (
          <p className="text-sm text-muted-foreground">
            Assigned to {complaint.assignedToDisplayName}
          </p>
        ) : null}
        {complaint.resolutionNotes ? (
          <p className="text-sm text-foreground">
            <span className="font-medium text-foreground">{t("detail.resolution")}:</span>{" "}
            {complaint.resolutionNotes}
          </p>
        ) : null}
      </article>

      {canManage ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(
                async () => {
                  const token = await getBrowserAccessToken();
                  await acknowledgeComplaint(token!, complaintId);
                },
                "Complaint acknowledged.",
              )
            }
          >
            Acknowledge
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(
                async () => {
                  const token = await getBrowserAccessToken();
                  await assignComplaint(token!, complaintId, currentUserId);
                },
                "Assigned to you.",
              )
            }
          >
            Assign to me
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const token = await getBrowserAccessToken();
                await startComplaint(token!, complaintId);
              }, "Marked in progress.")
            }
          >
            Start
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() =>
              run(async () => {
                const token = await getBrowserAccessToken();
                await closeComplaint(token!, complaintId);
              }, "Complaint closed.")
            }
          >
            Close
          </Button>
        </div>
      ) : null}

      {canManage ? (
        <form
          className="space-y-3 rounded-lg border border-border bg-card p-4"
          noValidate onSubmit={preservedSubmit((formData) => {
            const notes = String(formData.get("resolutionNotes") ?? "").trim();
            if (notes.length < 3) {
              setStatus("error");
              setMessage("Resolution notes are required.");
              return;
            }
            run(async () => {
              const token = await getBrowserAccessToken();
              await resolveComplaint(token!, complaintId, notes);
            }, "Complaint resolved.");
          })}
        >
          <h3 className="text-base font-semibold text-foreground">{t("detail.resolve")}</h3>
          <Field
            id="resolutionNotes"
            name="resolutionNotes"
            label={t("detail.resolutionNotes")}
          />
          <Button type="submit" disabled={pending}>
            Mark resolved
          </Button>
        </form>
      ) : null}

      {isOwner && complaint.status === "RESOLVED" ? (
        <form
          className="space-y-3 rounded-lg border border-border bg-card p-4"
          noValidate
          onSubmit={preservedSubmit((formData) => {
            const note = String(formData.get("reopenNote") ?? "").trim();
            if (note.length < 3) {
              setStatus("error");
              setMessage("Describe what is still wrong.");
              return;
            }
            run(async () => {
              const token = await getBrowserAccessToken();
              await reopenComplaint(token!, complaintId, note);
            }, "Complaint reopened.");
          })}
        >
          <label
            htmlFor="reopen-note"
            className="block text-sm font-medium text-foreground"
          >
            What is still wrong?
          </label>
          <textarea
            id="reopen-note"
            name="reopenNote"
            rows={3}
            className={textareaClassName}
            required
            minLength={3}
          />
          <Button type="submit" variant="secondary" disabled={pending}>
            Reopen complaint
          </Button>
        </form>
      ) : null}

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">{t("detail.statusHistory")}</h3>
        <ul className="space-y-2">
          {(complaint.statusHistory ?? []).map((entry) => (
            <li
              key={entry.id}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              {entry.fromStatus ?? "—"} → {entry.toStatus}
              {entry.note ? ` · ${entry.note}` : ""}
              <span className="mt-1 block text-xs text-muted-foreground">
                {entry.changedByDisplayName ?? "User"} ·{" "}
                {formatDateTime(entry.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">{t("detail.comments")}</h3>
        <ul className="space-y-2">
          {(complaint.comments ?? []).map((comment) => (
            <li
              key={comment.id}
              className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
            >
              {comment.body}
              <span className="mt-1 block text-xs text-muted-foreground">
                {comment.authorDisplayName ?? "User"} ·{" "}
                {formatDateTime(comment.createdAt)}
              </span>
            </li>
          ))}
        </ul>
        <form
          className="space-y-3 rounded-lg border border-border bg-card p-4"
          noValidate onSubmit={preservedSubmit((formData, form) => {
            const body = String(formData.get("body") ?? "").trim();
            if (!body) {
              setStatus("error");
              setMessage("Comment cannot be empty.");
              return;
            }
            run(async () => {
              const token = await getBrowserAccessToken();
              await addComplaintComment(token!, complaintId, body);
              form.reset();
            }, "Comment added.");
          })}
        >
          <Field id="body" name="body" label={t("detail.addComment")} />
          <Button type="submit" disabled={pending}>
            Post comment
          </Button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">{t("detail.attachments")}</h3>
        {(complaint.attachments?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">{t("detail.noImages")}</p>
        ) : (
          <ul className="space-y-2 text-sm text-foreground">
            {complaint.attachments?.map((attachment) => (
              <li
                key={attachment.id}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <span>
                  {attachment.originalFilename} ({attachment.contentType},{" "}
                  {attachment.sizeBytes} bytes)
                </span>
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => {
                    run(async () => {
                      const token = await getBrowserAccessToken();
                      if (!token) {
                        throw new ApiError(
                          "Sign in required",
                          401,
                          "UNAUTHORIZED",
                        );
                      }
                      await downloadComplaintAttachment(
                        token,
                        attachment.id,
                        attachment.originalFilename,
                      );
                    }, "Download started.");
                  }}
                >
                  Download
                </Button>
              </li>
            ))}
          </ul>
        )}
        {(isOwner || canManage) && complaint.status !== "CLOSED" ? (
          <div className="space-y-1.5">
            <label
              htmlFor="complaint-attachment"
              className="block text-sm font-medium text-foreground"
            >
              Upload image
            </label>
            <input
              id="complaint-attachment"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={pending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                run(async () => {
                  const token = await getBrowserAccessToken();
                  if (!token) {
                    throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
                  }
                  await uploadComplaintAttachment(token, complaintId, file);
                }, "Attachment uploaded.");
              }}
            />
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground">
          JPEG/PNG/WebP up to 5MB. Downloads require authorization. Uploads need
          storage enabled on the server for the pilot environment.
        </p>
      </section>
    </div>
  );
}
