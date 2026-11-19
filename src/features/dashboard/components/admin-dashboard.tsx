"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/layout/status-views";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { fetchAdminDashboard } from "../api";
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
      ? `Billing period ${data.maintenance.periodYear}-${String(data.maintenance.periodMonth).padStart(2, "0")}`
      : "No billing period selected";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {data.society.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.adminSubtitle", { period })}
          </p>
        </div>
        <StatusBadge value={data.society.status} />
      </div>

      <QuickActions
        societyId={societyId}
        actions={data.quickActions}
        catalog={ADMIN_ACTION_LINKS}
      />

      <DashboardSection title={t("dashboard.occupancy")}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t("dashboard.buildings")} value={data.occupancy.totalBuildings} />
          <Metric label={t("dashboard.units")} value={data.occupancy.totalUnits} />
          <Metric label={t("dashboard.occupied")} value={data.occupancy.occupiedUnits} />
          <Metric label={t("dashboard.vacant")} value={data.occupancy.vacantUnits} />
          <Metric label={t("dashboard.activeUnits")} value={data.occupancy.activeUnits} />
          <Metric label={t("dashboard.residents")} value={data.occupancy.activeResidentMemberships} />
          <Metric label={t("dashboard.administrators")} value={data.occupancy.activeAdminMemberships} />
          <Metric label={t("dashboard.householdMembers")} value={data.occupancy.activeHouseholdMembers} />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {t("dashboard.occupancyDefinition")}
        </p>
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.maintenance")}
        action={{ href: `/societies/${societyId}/billing`, label: t("dashboard.openBilling") }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t("dashboard.billed")} value={formatMoney(data.maintenance.totalBilled)} />
          <Metric label={t("dashboard.collected")} value={formatMoney(data.maintenance.totalCollected)} />
          <Metric label={t("dashboard.outstanding")} value={formatMoney(data.maintenance.totalOutstanding)} />
          <Metric label={t("dashboard.overdue")} value={formatMoney(data.maintenance.overdueAmount)} />
          <Metric label={t("dashboard.unpaidBills")} value={data.maintenance.unpaidInvoiceCount} />
          <Metric label={t("dashboard.partiallyPaid")} value={data.maintenance.partiallyPaidInvoiceCount} />
          <Metric label={t("dashboard.paidBills")} value={data.maintenance.paidInvoiceCount} />
        </div>
        <p className="text-xs text-muted-foreground">{t("dashboard.amountsNote")}</p>
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.complaints")}
        action={{ href: `/societies/${societyId}/complaints`, label: t("dashboard.viewComplaints") }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t("dashboard.open")} value={data.complaints.open} />
          <Metric label={t("dashboard.inProgress")} value={data.complaints.inProgress} />
          <Metric label={t("dashboard.resolved")} value={data.complaints.resolved} />
          <Metric label={t("dashboard.highOrUrgent")} value={data.complaints.highOrUrgent} />
        </div>
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
          <p className="text-sm text-muted-foreground">No complaints yet.</p>
        )}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.visitors")}
        action={{ href: `/societies/${societyId}/visitors`, label: t("dashboard.viewVisitors") }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label={t("dashboard.pendingApprovals")} value={data.visitors.pendingApprovals} />
          <Metric label={t("dashboard.checkedIn")} value={data.visitors.checkedIn} />
        </div>
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
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label={t("dashboard.drafts")} value={data.notices.draftCount} />
          <Metric label={t("dashboard.published")} value={data.notices.publishedCount} />
        </div>
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

      <DashboardSection title={t("dashboard.recentActivity")}>
        <ActivityList
          societyId={societyId}
          items={data.recentActivity}
          emptyMessage="No recent activity yet."
        />
      </DashboardSection>

      <p className="text-sm text-muted-foreground">
        Society profile settings are below.{" "}
        <Link href={`/societies/${societyId}/billing`} className="font-medium text-teal hover:underline">
          Billing
        </Link>
        {" · "}
        <Link href={`/societies/${societyId}/services`} className="font-medium text-teal hover:underline">
          Services
        </Link>
      </p>
    </div>
  );
}
