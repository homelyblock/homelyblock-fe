"use client";

import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { filterControlClassName } from "@/components/ui/control";
import { ListPager } from "@/components/ui/list-pager";
import { formatStatus } from "@/components/ui/status-tone";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { formatDateTime } from "@/lib/format-date";
import { ApiError } from "@/services/api-client";
import { fetchComplaintDashboard, fetchComplaints } from "../api";
import type {
  ComplaintCategory,
  ComplaintPriority,
  ComplaintStatus,
} from "../types";

const PAGE_SIZE = 20;

type ComplaintsOverviewProps = {
  societyId: string;
  canManage: boolean;
};

export function ComplaintsOverview({
  societyId,
  canManage,
}: ComplaintsOverviewProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [priority, setPriority] = useState<ComplaintPriority | "">("");
  const [page, setPage] = useState(1);

  const dashboardQuery = useQuery({
    queryKey: ["complaints-dashboard", societyId],
    enabled: canManage,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchComplaintDashboard(token, societyId);
    },
  });

  const listQuery = useQuery({
    queryKey: [
      "complaints",
      societyId,
      status || "all",
      category || "all",
      priority || "all",
      page,
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchComplaints(token, societyId, {
        status: status || undefined,
        category: category || undefined,
        priority: priority || undefined,
        page,
        limit: PAGE_SIZE,
      });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {canManage ? t("work.complaintsTitle") : t("work.complaintsMine")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage ? t("work.complaintsAdminHelp") : t("work.complaintsResidentHelp")}
          </p>
        </div>
        {!canManage ? (
          <Link
            href={`/societies/${societyId}/complaints/new`}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
          >
            Submit complaint
          </Link>
        ) : null}
      </div>

      {canManage ? (
        <section className="space-y-3" aria-label="Complaint dashboard">
          {dashboardQuery.isLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              {t("work.loading")}
            </p>
          ) : null}
          {dashboardQuery.isError ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {dashboardQuery.error instanceof ApiError
                ? dashboardQuery.error.message
                : t("work.loadFailed")}
            </p>
          ) : null}
          {dashboardQuery.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Total", dashboardQuery.data.total],
                ["Open", dashboardQuery.data.open],
                ["In progress", dashboardQuery.data.inProgress],
                ["Resolved", dashboardQuery.data.resolved],
                ["High / urgent", dashboardQuery.data.highOrUrgent],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="rounded-lg border border-border bg-card px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {value}
                  </p>
                </div>
              ))}
              <div className="rounded-lg border border-border bg-card px-4 py-3 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  By category
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {dashboardQuery.data.byCategory.length === 0
                    ? "No complaints yet."
                    : dashboardQuery.data.byCategory
                        .map((row) => `${formatStatus(row.category)} ${row.count}`)
                        .join(" · ")}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <select
          aria-label="Status filter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ComplaintStatus | "");
            setPage(1);
          }}
          className={filterControlClassName}
        >
          <option value="">{t("work.allStatuses")}</option>
          {(
            [
              "OPEN",
              "ACKNOWLEDGED",
              "IN_PROGRESS",
              "RESOLVED",
              "CLOSED",
              "REOPENED",
            ] as ComplaintStatus[]
          ).map((value) => (
            <option key={value} value={value}>
              {formatStatus(value)}
            </option>
          ))}
        </select>
        <select
          aria-label="Category filter"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as ComplaintCategory | "");
            setPage(1);
          }}
          className={filterControlClassName}
        >
          <option value="">{t("work.allCategories")}</option>
          {(
            [
              "PLUMBING",
              "ELECTRICAL",
              "CLEANING",
              "LIFT",
              "SECURITY",
              "PARKING",
              "GENERAL",
              "OTHER",
            ] as ComplaintCategory[]
          ).map((value) => (
            <option key={value} value={value}>
              {formatStatus(value)}
            </option>
          ))}
        </select>
        <select
          aria-label="Priority filter"
          value={priority}
          onChange={(event) => {
            setPriority(event.target.value as ComplaintPriority | "");
            setPage(1);
          }}
          className={filterControlClassName}
        >
          <option value="">{t("work.allPriorities")}</option>
          {(["LOW", "MEDIUM", "HIGH", "URGENT"] as ComplaintPriority[]).map(
            (value) => (
              <option key={value} value={value}>
                {formatStatus(value)}
              </option>
            ),
          )}
        </select>
      </div>

      <section className="space-y-3" aria-label="Complaint list">
        {listQuery.isLoading ? (
          <p className="text-sm text-muted-foreground" role="status">
            {t("work.loading")}
          </p>
        ) : null}
        {listQuery.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {listQuery.error instanceof ApiError
              ? listQuery.error.message
              : t("work.loadFailed")}
          </p>
        ) : null}
        {!listQuery.isLoading &&
        !listQuery.isError &&
        (listQuery.data?.items.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
            No complaints match these filters.
          </p>
        ) : null}
        <ul className="space-y-2">
          {(listQuery.data?.items ?? []).map((complaint) => (
            <li key={complaint.id}>
              <Link
                href={`/societies/${societyId}/complaints/${complaint.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/60"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {complaint.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                    {formatStatus(complaint.category)} ·{" "}
                    {complaint.buildingCode ?? ""}-
                    {complaint.unitNumber ?? ""} ·{" "}
                    {formatDateTime(complaint.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge value={complaint.priority} />
                  <StatusBadge value={complaint.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <ListPager
          page={listQuery.data?.page ?? page}
          pageSize={listQuery.data?.limit ?? PAGE_SIZE}
          total={listQuery.data?.total ?? 0}
          disabled={listQuery.isFetching}
          onPage={setPage}
        />
      </section>
    </div>
  );
}
