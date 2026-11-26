"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/badge";
import { LoadingSkeleton } from "@/components/layout/status-views";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { fetchOwnHousehold } from "@/features/households/api";
import { fetchServices } from "@/features/services/api";
import { formatDate } from "@/lib/format-date";
import { formatIndianPhone } from "@/lib/indian-phone";
import { ApiError } from "@/services/api-client";
import { fetchResidentDashboard } from "../api";
import { formatMoney, RESIDENT_ACTION_LINKS } from "../links";
import { ActivityList } from "./activity-list";
import { DashboardSection, LinkMetric, RecordLink } from "./metric";
import { QuickActions } from "./quick-actions";
import { useI18n } from "@/i18n/provider";

type ResidentDashboardProps = {
  societyId: string;
};

async function requireToken() {
  const token = await getBrowserAccessToken();
  if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
  return token;
}

export function ResidentDashboardPanel({ societyId }: ResidentDashboardProps) {
  const { t } = useI18n();
  const query = useQuery({
    queryKey: ["dashboard", "resident", societyId],
    queryFn: async () => fetchResidentDashboard(await requireToken(), societyId),
  });
  const householdQuery = useQuery({
    queryKey: ["household", "own", societyId],
    queryFn: async () => fetchOwnHousehold(await requireToken(), societyId, true),
  });
  const servicesQuery = useQuery({
    queryKey: ["services", societyId, "dashboard"],
    queryFn: async () =>
      fetchServices(await requireToken(), societyId, { active: true, limit: 4 }),
  });

  if (query.isLoading) {
    return <LoadingSkeleton label={t("dashboard.loadingResident")} />;
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
  const unitLabel =
    data.membership.buildingName && data.membership.unitNumber
      ? `${data.membership.buildingName} · ${t("dashboard.unitWord")} ${data.membership.unitNumber}`
      : t("dashboard.noPrimaryUnit");
  const outstanding = Number(data.maintenance.outstandingBalance);
  const hasAttention =
    outstanding > 0 ||
    data.notices.unreadCount > 0 ||
    data.complaints.openOrInProgressCount > 0 ||
    data.visitors.pendingApprovalCount > 0;
  const householdCount = householdQuery.data?.items.length ?? 0;
  const updatedLabel =
    query.dataUpdatedAt > 0
      ? t("dashboard.updatedAt", {
          time: new Date(query.dataUpdatedAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })
      : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {unitLabel}
          </p>
          <h1 className="page-title mt-1">{data.society.name}</h1>
          {updatedLabel ? (
            <p className="mt-1 text-xs text-muted-foreground">{updatedLabel}</p>
          ) : null}
        </div>
        <StatusBadge value={data.membership.status} />
      </div>

      <section className="surface-raised space-y-4 px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              {t("dashboard.myHome")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{unitLabel}</p>
          </div>
          <Link
            href={`/societies/${societyId}/household`}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("dashboard.manageHousehold")}
          </Link>
        </div>
        <dl className="grid gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {t("dashboard.householdMembers")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {householdQuery.isLoading ? "…" : householdCount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {t("dashboard.outstanding")}
            </dt>
            <dd
              className={`mt-1 text-lg font-semibold tabular-nums ${
                outstanding > 0 ? "text-[var(--theme-attention)]" : "text-foreground"
              }`}
            >
              {formatMoney(data.maintenance.outstandingBalance)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-muted-foreground">
              {t("dashboard.openComplaints")}
            </dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">
              {data.complaints.openOrInProgressCount}
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          {t("dashboard.attention")}
        </h2>
        {hasAttention ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <LinkMetric
              href={`/societies/${societyId}/billing`}
              label={t("dashboard.outstanding")}
              value={formatMoney(data.maintenance.outstandingBalance)}
              emphasize={outstanding > 0}
            />
            <LinkMetric
              href={`/societies/${societyId}/notices`}
              label={t("dashboard.unreadNotices")}
              value={data.notices.unreadCount}
              emphasize={data.notices.unreadCount > 0}
            />
            <LinkMetric
              href={`/societies/${societyId}/complaints`}
              label={t("dashboard.openComplaints")}
              value={data.complaints.openOrInProgressCount}
              emphasize={data.complaints.openOrInProgressCount > 0}
            />
            <LinkMetric
              href={`/societies/${societyId}/visitors`}
              label={t("dashboard.pendingVisitors")}
              value={data.visitors.pendingApprovalCount}
              emphasize={data.visitors.pendingApprovalCount > 0}
            />
          </div>
        ) : (
          <p className="surface-card px-4 py-3 text-sm text-muted-foreground">
            {t("dashboard.nothingWaiting")}
          </p>
        )}
      </section>

      <QuickActions
        societyId={societyId}
        actions={data.quickActions}
        catalog={RESIDENT_ACTION_LINKS}
      />

      <DashboardSection
        title={t("nav.household")}
        action={{ href: `/societies/${societyId}/household`, label: t("dashboard.manageHousehold") }}
      >
        <p className="text-sm text-muted-foreground">{unitLabel}</p>
        {householdQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.loadingHousehold")}</p>
        ) : householdQuery.isError || !householdQuery.data ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.householdFailed")}</p>
        ) : householdQuery.data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.noHousehold")}</p>
        ) : (
          <ul className="space-y-2">
            {householdQuery.data.items.map((member) => (
              <li
                key={member.id}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{member.name}</span>
                <span className="text-muted-foreground">
                  {" "}
                  · {member.relationship.replaceAll("_", " ").toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.maintenance")}
        action={{ href: `/societies/${societyId}/billing`, label: t("dashboard.viewBills") }}
      >
        {data.maintenance.openBills.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.noOpenBills")}</p>
        ) : (
          <ul className="space-y-2">
            {data.maintenance.openBills.map((bill) => (
              <li key={bill.id}>
                <RecordLink href={`/societies/${societyId}/billing/bills/${bill.id}`}>
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {bill.invoiceNumber} · {formatMoney(bill.outstandingAmount)} {t("dashboard.due")} {formatDate(bill.dueDate)}
                    </span>
                    <StatusBadge value={bill.status} />
                  </span>
                </RecordLink>
              </li>
            ))}
          </ul>
        )}
        {data.maintenance.recentPayments.length > 0 ? (
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {t("dashboard.recentPayments")}
            </p>
            <ul className="space-y-1 text-sm text-foreground">
              {data.maintenance.recentPayments.map((payment) => (
                <li key={payment.id}>
                  {formatMoney(payment.amount)} · {payment.method.replaceAll("_", " ")} ·{" "}
                  {formatDate(payment.paidAt)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.notices")}
        action={{ href: `/societies/${societyId}/notices`, label: t("dashboard.allNotices") }}
      >
        {data.notices.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.noNotices")}</p>
        ) : (
          <ul className="space-y-2">
            {data.notices.recent.map((notice) => (
              <li key={notice.id}>
                <RecordLink href={`/societies/${societyId}/notices/${notice.id}`}>
                  {notice.title}
                  {!notice.isRead ? ` · ${t("dashboard.unreadMark")}` : ""}
                </RecordLink>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.complaints")}
        action={{ href: `/societies/${societyId}/complaints`, label: t("dashboard.allComplaints") }}
      >
        {data.complaints.recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.noComplaints")}</p>
        ) : (
          <ul className="space-y-2">
            {data.complaints.recent.map((complaint) => (
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
        )}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.visitors")}
        action={{ href: `/societies/${societyId}/visitors`, label: t("dashboard.visitorRecords") }}
      >
        {data.visitors.recentExpected.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.noVisitors")}</p>
        ) : (
          <ul className="space-y-2">
            {data.visitors.recentExpected.map((visitor) => (
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
        )}
      </DashboardSection>

      <DashboardSection
        title={t("dashboard.services")}
        action={{ href: `/societies/${societyId}/services`, label: t("dashboard.fullDirectory") }}
      >
        {servicesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.loadingServices")}</p>
        ) : servicesQuery.isError || !servicesQuery.data ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.servicesFailed")}</p>
        ) : servicesQuery.data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.noServices")}</p>
        ) : (
          <ul className="space-y-2">
            {servicesQuery.data.items.map((service) => (
              <li key={service.id}>
                <RecordLink href={`/societies/${societyId}/services/${service.id}`}>
                  <span className="font-medium">{service.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    · {service.category.replaceAll("_", " ").toLowerCase()} · {formatIndianPhone(service.phone)}
                  </span>
                </RecordLink>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

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
