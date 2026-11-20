"use client";

import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { filterControlClassName } from "@/components/ui/control";
import { ListPager } from "@/components/ui/list-pager";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { formatDateTime } from "@/lib/format-date";
import { ApiError } from "@/services/api-client";
import { fetchNotices } from "../api";
import type { NoticeStatus } from "../types";

const PAGE_SIZE = 20;
const STATUSES: NoticeStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

type NoticesListProps = {
  societyId: string;
  canManage: boolean;
};

export function NoticesList({ societyId, canManage }: NoticesListProps) {
  const { t } = useI18n();
  const [status, setStatus] = useState<NoticeStatus | "">("");
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["notices", societyId, status || "all", page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchNotices(token, societyId, {
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
    },
  });

  const notices = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("work.noticesTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage ? t("work.noticesAdmin") : t("work.noticesResident")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canManage ? (
            <>
              <div className="space-y-1.5">
                <label
                  htmlFor="notice-status-filter"
                  className="block text-sm font-medium text-foreground"
                >
                  {t("directory.status")}
                </label>
                <select
                  id="notice-status-filter"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as NoticeStatus | "");
                    setPage(1);
                  }}
                  className={filterControlClassName}
                >
                  <option value="">{t("work.all")}</option>
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {t(`status.${value}`)}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                href={`/societies/${societyId}/notices/new`}
                className="inline-flex h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
              >
                {t("work.createNotice")}
              </Link>
            </>
          ) : null}
        </div>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("work.loadingNotices")}
        </p>
      ) : null}
      {query.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {query.error instanceof ApiError
            ? query.error.message
            : t("work.noticesFailed")}
        </p>
      ) : null}
      {!query.isLoading && !query.isError && notices.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {status ? t("work.noNoticesFilter") : t("work.noNotices")}
        </p>
      ) : null}

      {notices.length > 0 ? (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link
                href={`/societies/${societyId}/notices/${notice.id}`}
                className="flex items-start justify-between gap-3 px-4 py-3 hover:bg-muted/60"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {notice.title}
                    </p>
                    <StatusBadge value={notice.status} />
                    {notice.isRead === false ? <Badge tone="info">{t("work.unread")}</Badge> : null}
                    {notice.isRead ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {t("work.read")}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t(`status.${notice.category}`)} · {t(`status.${notice.audienceType}`)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Published {formatDateTime(notice.publishedAt)}
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
