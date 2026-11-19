"use client";

import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { filterControlClassName } from "@/components/ui/control";
import { ListPager } from "@/components/ui/list-pager";
import { formatStatus } from "@/components/ui/status-tone";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { fetchBillingDashboard, fetchBills } from "../api";
import { formatDate } from "@/lib/format-date";
import { formatMoney, formatPeriod } from "../format";
import type { BillStatus } from "../types";

const PAGE_SIZE = 20;
const BILL_STATUSES: BillStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];
const RESIDENT_BILL_STATUSES: BillStatus[] = [
  "PUBLISHED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
];

function validPeriod(year: number, month: number) {
  return (
    Number.isInteger(year) &&
    year >= 2000 &&
    year <= 2100 &&
    month >= 1 &&
    month <= 12
  );
}

type BillingOverviewProps = {
  societyId: string;
  canManage: boolean;
};

export function BillingOverview({ societyId, canManage }: BillingOverviewProps) {
  const now = useMemo(() => new Date(), []);
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
  const [status, setStatus] = useState<BillStatus | "">("");
  const [page, setPage] = useState(1);
  const periodOk = validPeriod(periodYear, periodMonth);

  const dashboardQuery = useQuery({
    queryKey: ["billing-dashboard", societyId, periodYear, periodMonth],
    enabled: canManage && periodOk,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBillingDashboard(token, societyId, {
        periodYear,
        periodMonth,
      });
    },
  });

  const billsQuery = useQuery({
    queryKey: [
      "maintenance-bills",
      societyId,
      periodYear,
      periodMonth,
      status || "all",
      page,
    ],
    enabled: periodOk,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBills(token, societyId, {
        periodYear,
        periodMonth,
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
    },
  });

  const outstandingTotal = useMemo(() => {
    const items = billsQuery.data?.items ?? [];
    return items
      .filter(
        (bill) =>
          bill.status !== "DRAFT" &&
          bill.status !== "CANCELLED" &&
          Number(bill.outstandingAmount) > 0,
      )
      .reduce((sum, bill) => sum + Number(bill.outstandingAmount), 0)
      .toFixed(2);
  }, [billsQuery.data?.items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {canManage ? "Billing" : "My bills"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage
              ? "Maintenance configuration, bill generation, collections, and invoice history."
              : "Outstanding dues, invoice details, and payment history for your unit."}
          </p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/societies/${societyId}/billing/config`}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60"
            >
              Configuration
            </Link>
            <Link
              href={`/societies/${societyId}/billing/generate`}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
            >
              Generate bills
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="space-y-1.5">
          <label
            htmlFor="billing-period-year"
            className="block text-sm font-medium text-foreground"
          >
            Year
          </label>
          <input
            id="billing-period-year"
            type="number"
            min={2000}
            max={2100}
            value={periodYear}
            onChange={(event) => {
              const next = event.target.value === "" ? 0 : Number(event.target.value);
              setPeriodYear(Number.isFinite(next) ? next : 0);
              setPage(1);
            }}
            className={`${filterControlClassName} w-28`}
          />
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="billing-period-month"
            className="block text-sm font-medium text-foreground"
          >
            Month
          </label>
          <select
            id="billing-period-month"
            value={periodMonth}
            onChange={(event) => {
              setPeriodMonth(Number(event.target.value));
              setPage(1);
            }}
            className={filterControlClassName}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map(
              (month) => (
                <option key={month} value={month}>
                  {new Date(Date.UTC(2000, month - 1, 1)).toLocaleString("en-IN", {
                    month: "long",
                    timeZone: "UTC",
                  })}
                </option>
              ),
            )}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="billing-status-filter"
            className="block text-sm font-medium text-foreground"
          >
            Status
          </label>
          <select
            id="billing-status-filter"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as BillStatus | "");
              setPage(1);
            }}
            className={filterControlClassName}
          >
            <option value="">All</option>
            {(canManage ? BILL_STATUSES : RESIDENT_BILL_STATUSES).map((value) => (
              <option key={value} value={value}>
                {formatStatus(value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {canManage ? (
        <section aria-label="Billing dashboard" className="space-y-3">
          {dashboardQuery.isLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Loading dashboard…
            </p>
          ) : null}
          {dashboardQuery.isError ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {dashboardQuery.error instanceof ApiError
                ? dashboardQuery.error.message
                : "Unable to load billing dashboard."}
            </p>
          ) : null}
          {dashboardQuery.data ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Total billed", dashboardQuery.data.totalBilled],
                ["Total collected", dashboardQuery.data.totalCollected],
                ["Outstanding", dashboardQuery.data.totalOutstanding],
                ["Overdue", dashboardQuery.data.overdueAmount],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-border bg-card px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>
                  <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                    {formatMoney(value)}
                  </p>
                </div>
              ))}
              <div className="rounded-lg border border-border bg-card px-4 py-3 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Invoice counts
                </p>
                <p className="mt-1 text-sm text-foreground">
                  Paid {dashboardQuery.data.paidInvoiceCount} · Partially paid{" "}
                  {dashboardQuery.data.partiallyPaidInvoiceCount} · Unpaid{" "}
                  {dashboardQuery.data.unpaidInvoiceCount}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      ) : (
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Outstanding dues
            {(billsQuery.data?.total ?? 0) > (billsQuery.data?.items.length ?? 0)
              ? " on this page"
              : ""}
          </p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {billsQuery.isLoading
              ? "…"
              : formatMoney(outstandingTotal || "0.00")}
          </p>
        </div>
      )}

      <section aria-label="Invoices" className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">
          Invoices
          {periodOk ? ` · ${formatPeriod(periodYear, periodMonth)}` : ""}
        </h3>
        {!periodOk ? (
          <p className="text-sm text-muted-foreground">
            Enter a year from 2000 to 2100 to load invoices.
          </p>
        ) : null}
        {billsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading invoices…
          </p>
        ) : null}
        {billsQuery.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {billsQuery.error instanceof ApiError
              ? billsQuery.error.message
              : "Unable to load invoices."}
          </p>
        ) : null}
        {!billsQuery.isLoading &&
        !billsQuery.isError &&
        periodOk &&
        (billsQuery.data?.items.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
            No invoices for this period.
          </p>
        ) : null}
        <ul className="space-y-2">
          {(billsQuery.data?.items ?? []).map((bill) => (
            <li key={bill.id}>
              <Link
                href={`/societies/${societyId}/billing/bills/${bill.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/60"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {bill.invoiceNumber}
                    {bill.buildingCode || bill.unitNumber
                      ? ` · ${bill.buildingCode ?? ""}-${bill.unitNumber ?? ""}`
                      : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Due {formatDate(bill.dueDate)} · Total {formatMoney(bill.totalAmount)}
                  </p>
                </div>
                <StatusBadge value={bill.status} />
              </Link>
            </li>
          ))}
        </ul>
        <ListPager
          page={billsQuery.data?.page ?? page}
          pageSize={billsQuery.data?.limit ?? PAGE_SIZE}
          total={billsQuery.data?.total ?? 0}
          disabled={billsQuery.isFetching}
          onPage={setPage}
        />
      </section>
    </div>
  );
}
