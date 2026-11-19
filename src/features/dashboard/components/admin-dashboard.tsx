"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/layout/status-views";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { fetchAdminDashboard, fetchAttention } from "../api";
import { ADMIN_ACTION_LINKS, formatMoney } from "../links";
import { ActivityList } from "./activity-list";
import { DashboardSection, Metric, RecordLink } from "./metric";
import { QuickActions } from "./quick-actions";
import { useI18n } from "@/i18n/provider";

type AdminDashboardProps = {
  societyId: string;
};

export function AdminDashboardPanel({ societyId }: AdminDashboardProps) {
  const { t } = useI18n();
  const query = useQuery({
    queryKey: ["dashboard", "admin", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchAdminDashboard(token, societyId);
    },
  });

  if (query.isLoading) {
    return <LoadingSkeleton label={t("dashboard.loadingAdmin")} />;
  }

  if (query.isError) {
    return (
      <Alert>
        <p>
          {query.error instanceof ApiError
            ? query.error.message
            : t("dashboard.loadError")}
        </p>
        <button type="button" className="mt-2 font-medium underline" onClick={() => void query.refetch()}>
          {t("common.retry")}
        </button>
      </Alert>
    );
  }

  const data = query.data;
  if (!data) return null;
  const period =
    data.maintenance.periodYear && data.maintenance.periodMonth
      ? `${data.maintenance.periodYear}-${String(data.maintenance.periodMonth).padStart(2, "0")}`
      : t("dashboard.noPeriod");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("dashboard.adminSubtitle", { period })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {data.society.name}
          </h1>
        </div>
        <StatusBadge value={data.society.status} />
      </div>

      <QuickActions
        societyId={societyId}
        actions={data.quickActions}
        catalog={ADMIN_ACTION_LINKS}
      />

      <AttentionPanel societyId={societyId} />

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <DashboardSection title={t("dashboard.communitySnapshot")}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label={t("dashboard.buildings")} value={data.occupancy.totalBuildings} />
            <Metric label={t("dashboard.units")} value={data.occupancy.totalUnits} />
            <Metric label={t("dashboard.occupied")} value={data.occupancy.occupiedUnits} />
            <Metric label={t("dashboard.vacant")} value={data.occupancy.vacantUnits} />
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            {t("dashboard.residents")}: {data.occupancy.activeResidentMemberships}
            {" · "}
            {t("dashboard.administrators")}: {data.occupancy.activeAdminMemberships}
            {" · "}
            {t("dashboard.householdMembers")}: {data.occupancy.activeHouseholdMembers}
          </p>
          <p className="text-xs leading-5 text-muted-foreground">
            {t("dashboard.occupancyDefinition")}
          </p>
        </DashboardSection>

        <DashboardSection
          title={t("dashboard.financeSnapshot")}
          action={{ href: `/societies/${societyId}/billing`, label: t("dashboard.openBilling") }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Metric label={t("dashboard.outstanding")} value={formatMoney(data.maintenance.totalOutstanding)} />
            <Metric label={t("dashboard.overdue")} value={formatMoney(data.maintenance.overdueAmount)} />
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            {t("dashboard.billed")}: {formatMoney(data.maintenance.totalBilled)}
            {" · "}
            {t("dashboard.collected")}: {formatMoney(data.maintenance.totalCollected)}
            {" · "}
            {t("dashboard.unpaidBills")}: {data.maintenance.unpaidInvoiceCount}
          </p>
          <p className="text-xs text-muted-foreground">{t("dashboard.amountsNote")}</p>
        </DashboardSection>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
      <DashboardSection
        title={t("dashboard.complaints")}
        action={{ href: `/societies/${societyId}/complaints`, label: t("dashboard.viewComplaints") }}
      >
        <p className="text-xs text-muted-foreground">
          {t("dashboard.open")} {data.complaints.open}
          {" · "}
          {t("dashboard.inProgress")} {data.complaints.inProgress}
          {" · "}
          {t("dashboard.highOrUrgent")} {data.complaints.highOrUrgent}
        </p>
        {data.complaints.recent.length > 0 ? (
          <ul className="space-y-2">
            {data.complaints.recent.slice(0, 5).map((complaint) => (
              <li key={complaint.id}>
                <RecordLink href={`/societies/${societyId}/complaints/${complaint.id}`}>
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span>{complaint.title}</span>
                    <StatusBadge value={complaint.status} />
                  </span>
                </RecordLink>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{t("dashboard.noComplaints")}</p>
        )}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.visitors")}
        action={{ href: `/societies/${societyId}/visitors`, label: t("dashboard.viewVisitors") }}
      >
        <p className="text-xs text-muted-foreground">
          {t("dashboard.pendingApprovals")} {data.visitors.pendingApprovals}
          {" · "}
          {t("dashboard.checkedIn")} {data.visitors.checkedIn}
        </p>
        {data.visitors.recent.length > 0 ? (
          <ul className="space-y-2">
            {data.visitors.recent.slice(0, 5).map((visitor) => (
              <li key={visitor.id}>
                <RecordLink href={`/societies/${societyId}/visitors/${visitor.id}`}>
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span>{visitor.visitorName}</span>
                    <StatusBadge value={visitor.status} />
                  </span>
                </RecordLink>
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.notices")}
        action={{ href: `/societies/${societyId}/notices/new`, label: t("dashboard.createNotice") }}
      >
        <p className="text-xs text-muted-foreground">
          {t("dashboard.drafts")} {data.notices.draftCount}
          {" · "}
          {t("dashboard.published")} {data.notices.publishedCount}
        </p>
        {data.notices.recent.length > 0 ? (
          <ul className="space-y-2">
            {data.notices.recent.map((notice) => (
              <li key={notice.id}>
                <RecordLink href={`/societies/${societyId}/notices/${notice.id}`}>
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span>{notice.title}</span>
                    <StatusBadge value={notice.status} />
                  </span>
                </RecordLink>
              </li>
            ))}
          </ul>
        ) : null}
      </DashboardSection>
      </div>

      <DashboardSection title={t("dashboard.recentActivity")}>
        <ActivityList
          societyId={societyId}
          items={data.recentActivity}
          emptyMessage={t("dashboard.noActivity")}
        />
      </DashboardSection>
    </div>
  );
}

function AttentionPanel({ societyId }: { societyId: string }) {
  const { t } = useI18n();
  const query = useQuery({
    queryKey: ["attention", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchAttention(token, societyId);
    },
  });
  const counts = query.data?.counts;
  const items = [
    { key: "complaints", count: counts?.complaints ?? 0, href: `/societies/${societyId}/complaints`, label: t("nav.complaints") },
    { key: "members", count: counts?.members ?? 0, href: `/societies/${societyId}/members`, label: t("dashboard.pendingMembers") },
    { key: "visitors", count: counts?.visitors ?? 0, href: `/societies/${societyId}/visitors`, label: t("dashboard.pendingApprovals") },
    { key: "notices", count: counts?.notices ?? 0, href: `/societies/${societyId}/notices`, label: t("nav.notices") },
    { key: "billing", count: counts?.billing ?? 0, href: `/societies/${societyId}/billing`, label: t("dashboard.billingAttention") },
  ].filter((item) => item.count > 0);

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight">{t("dashboard.attention")}</h2>
      {query.isLoading ? (
        <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {t("dashboard.nothingWaiting")}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm hover:bg-muted/60"
              >
                <span className="font-medium">{item.label}</span>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                  {item.count > 99 ? "99+" : item.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
