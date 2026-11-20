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
import { fetchVisitors } from "../api";
import type { VisitorStatus } from "../types";

const PAGE_SIZE = 20;
const STATUSES: VisitorStatus[] = [
  "PENDING",
  "APPROVED",
  "CHECKED_IN",
  "CHECKED_OUT",
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
];

type VisitorsListProps = {
  societyId: string;
  canManage: boolean;
};

export function VisitorsList({ societyId, canManage }: VisitorsListProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<VisitorStatus | "">("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["visitors", societyId, status || "all", page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchVisitors(token, societyId, {
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
    },
  });

  const visitors = query.data?.items ?? [];
  const pendingTotal = status === "PENDING" ? (query.data?.total ?? 0) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("work.visitorsTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage ? t("work.visitorsAdmin") : t("work.visitorsResident")}
          </p>
          {pendingTotal > 0 ? (
            <p className="mt-2 text-sm font-medium text-warning">
              {t("work.awaitingApproval", { count: pendingTotal })}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="space-y-1.5">
            <label
              htmlFor="visitor-status-filter"
              className="block text-sm font-medium text-foreground"
            >
              Status
            </label>
            <select
              id="visitor-status-filter"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as VisitorStatus | "");
                setPage(1);
              }}
              className={filterControlClassName}
            >
              <option value="">{t("work.all")}</option>
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {formatStatus(value)}
                </option>
              ))}
            </select>
          </div>
          {canManage ? (
            <Link
              href={`/societies/${societyId}/visitors/walk-in`}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
            >
              Register walk-in
            </Link>
          ) : (
            <Link
              href={`/societies/${societyId}/visitors/expected`}
              className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
            >
              Register visitor
            </Link>
          )}
        </div>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("work.loading")}
        </p>
      ) : null}
      {query.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {query.error instanceof ApiError
            ? query.error.message
            : t("work.loadFailed")}
        </p>
      ) : null}
      {!query.isLoading && !query.isError && visitors.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {status ? "No visitors match this filter." : "No visitors found."}
        </p>
      ) : null}

      {visitors.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {visitors.map((visitor) => (
            <li key={visitor.id}>
              <Link
                href={`/societies/${societyId}/visitors/${visitor.id}`}
                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/60"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {visitor.visitorName}
                    </p>
                    <StatusBadge value={visitor.status} />
                    {visitor.status === "PENDING" ? (
                      <span className="rounded bg-warning/10 px-1.5 py-0.5 text-[11px] font-medium text-warning">
                        Needs approval
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground capitalize">
                    {formatStatus(visitor.entryType)} · Unit{" "}
                    {visitor.unitNumber ?? visitor.unitId.slice(0, 8)} · {visitor.purpose}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected {formatDateTime(visitor.expectedAt)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <ListPager
        page={query.data?.page ?? page}
        pageSize={query.data?.limit ?? PAGE_SIZE}
        total={query.data?.total ?? 0}
        disabled={query.isFetching}
        onPage={setPage}
      />
    </div>
  );
}
