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

type AdminDashboardProps = {
  societyId: string;
};

export function AdminDashboardPanel({ societyId }: AdminDashboardProps) {
  const query = useQuery({
    queryKey: ["dashboard", "admin", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchAdminDashboard(token, societyId);
    },
  });

  if (query.isLoading) {
    return <LoadingSkeleton label="Loading society dashboard" />;
  }

  if (query.isError) {
    return (
      <Alert>
        {query.error instanceof ApiError
          ? query.error.message
          : "Unable to load dashboard."}
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
            Society administration · {period}
          </p>
        </div>
        <StatusBadge value={data.society.status} />
      </div>

      <QuickActions
        societyId={societyId}
        actions={data.quickActions}
        catalog={ADMIN_ACTION_LINKS}
      />

      <DashboardSection title="Occupancy">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Buildings" value={data.occupancy.totalBuildings} />
          <Metric label="Units" value={data.occupancy.totalUnits} />
          <Metric label="Occupied units" value={data.occupancy.occupiedUnits} />
          <Metric label="Vacant units" value={data.occupancy.vacantUnits} />
          <Metric label="Active units" value={data.occupancy.activeUnits} />
          <Metric label="Residents" value={data.occupancy.activeResidentMemberships} />
          <Metric label="Administrators" value={data.occupancy.activeAdminMemberships} />
          <Metric label="Household members" value={data.occupancy.activeHouseholdMembers} />
        </div>
        <p className="text-xs leading-5 text-muted-foreground">
          {data.occupancy.occupancyDefinition}
        </p>
      </DashboardSection>

      <DashboardSection
        title="Maintenance"
        action={{ href: `/societies/${societyId}/billing`, label: "Open billing" }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Billed" value={formatMoney(data.maintenance.totalBilled)} />
          <Metric label="Collected" value={formatMoney(data.maintenance.totalCollected)} />
          <Metric label="Outstanding" value={formatMoney(data.maintenance.totalOutstanding)} />
          <Metric label="Overdue" value={formatMoney(data.maintenance.overdueAmount)} />
          <Metric label="Unpaid bills" value={data.maintenance.unpaidInvoiceCount} />
          <Metric label="Partially paid" value={data.maintenance.partiallyPaidInvoiceCount} />
          <Metric label="Paid bills" value={data.maintenance.paidInvoiceCount} />
        </div>
        <p className="text-xs text-muted-foreground">
          Amounts are records. Payments are entered here after they are collected outside LivingSpace.
        </p>
      </DashboardSection>

      <DashboardSection
        title="Complaints"
        action={{ href: `/societies/${societyId}/complaints`, label: "View complaints" }}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Open" value={data.complaints.open} />
          <Metric label="In progress" value={data.complaints.inProgress} />
          <Metric label="Resolved" value={data.complaints.resolved} />
          <Metric label="High or urgent" value={data.complaints.highOrUrgent} />
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
        title="Visitors"
        action={{ href: `/societies/${societyId}/visitors`, label: "View visitors" }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Pending approvals" value={data.visitors.pendingApprovals} />
          <Metric label="Checked in" value={data.visitors.checkedIn} />
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
        title="Notices"
        action={{ href: `/societies/${societyId}/notices/new`, label: "Create notice" }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Metric label="Drafts" value={data.notices.draftCount} />
          <Metric label="Published" value={data.notices.publishedCount} />
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

      <DashboardSection title="Recent activity">
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
