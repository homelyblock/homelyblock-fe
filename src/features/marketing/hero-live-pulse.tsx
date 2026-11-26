"use client";

import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";
import { fetchPlatformStats } from "@/features/marketing/platform-stats";
import { useI18n } from "@/i18n/provider";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function formatMonthLabel(month: string) {
  const [year, mon] = month.split("-");
  const date = new Date(Date.UTC(Number(year), Number(mon) - 1, 1));
  return date.toLocaleString(undefined, { month: "short" });
}

export function HeroLivePulse() {
  const { t } = useI18n();
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    () => true,
  );
  const query = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const stats = query.data;
  const monthly = stats?.monthly ?? [];
  const activityBars = monthly.map((point) => point.activity);
  const maxBar = Math.max(1, ...activityBars);
  const growthLine = monthly.map((point) => point.societies + point.buildings);
  const maxLine = Math.max(1, ...growthLine);

  const points = growthLine
    .map((value, index) => {
      const x =
        growthLine.length <= 1 ? 140 : (index / (growthLine.length - 1)) * 280;
      const y = 72 - (value / maxLine) * 56;
      return `${x},${y}`;
    })
    .join(" ");
  const area = growthLine.length > 0 ? `0,72 ${points} 280,72` : "0,72 280,72";
  const loading = query.isLoading;

  return (
    <div className="relative w-full">
      <div className="absolute -inset-4 rounded-[1.75rem] bg-[color-mix(in_srgb,var(--theme-sage)_45%,transparent)] blur-2xl sm:-inset-6" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card/95 shadow-[var(--theme-shadow-raised)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div>
            <p className="text-sm font-semibold text-foreground">{t("landing.pulseTitle")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("landing.pulseCaption")}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-[11px] font-semibold text-accent-foreground">
            <span
              className={`size-1.5 rounded-full bg-primary ${query.isFetching ? "animate-pulse" : ""}`}
              aria-hidden
            />
            {query.isError ? t("landing.pulseUnavailable") : t("landing.pulseLive")}
          </span>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
          <MetricTile
            label={t("landing.pulseSocieties")}
            value={loading ? "…" : String(stats?.societies ?? 0)}
            suffix={t("landing.pulseSocietiesHint")}
          />
          <MetricTile
            label={t("landing.pulseMemberships")}
            value={loading ? "…" : String(stats?.memberships ?? 0)}
            suffix={t("landing.pulseMembershipsHint")}
          />
          <MetricTile
            label={t("landing.pulseActivityMonth")}
            value={loading ? "…" : String(stats?.activityThisMonth ?? 0)}
            suffix={t("landing.pulseActivityMonthHint")}
          />
        </div>

        <div className="grid gap-3 border-t border-border p-4 sm:grid-cols-3 sm:p-5">
          <MetricTile
            label={t("landing.pulseNotices")}
            value={loading ? "…" : String(stats?.noticesPublished ?? 0)}
            suffix={t("landing.pulseNoticesHint")}
          />
          <MetricTile
            label={t("landing.pulseVisitors")}
            value={loading ? "…" : String(stats?.visitorsHandled ?? 0)}
            suffix={t("landing.pulseVisitorsHint")}
          />
          <MetricTile
            label={t("landing.pulsePayments")}
            value={loading ? "…" : String(stats?.paymentsRecorded ?? 0)}
            suffix={t("landing.pulsePaymentsHint")}
          />
        </div>

        <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("landing.pulseActivityTrend")}
            </p>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {(monthly.length > 0 ? monthly : Array.from({ length: 6 }, () => null)).map(
                (point, index) => {
                  const height =
                    point == null
                      ? 12
                      : Math.max(8, Math.round((point.activity / maxBar) * 100));
                  return (
                    <div key={point?.month ?? index} className="flex flex-1 flex-col justify-end">
                      <div
                        className="w-full rounded-t-md bg-primary/85 origin-bottom"
                        style={{
                          height: `${height}%`,
                          opacity: point == null ? 0.25 : 1,
                          animation:
                            reduced || point == null
                              ? undefined
                              : `hero-bar-rise 0.7s ${index * 0.05}s cubic-bezier(0.22, 1, 0.36, 1) both`,
                        }}
                        title={
                          point
                            ? `${formatMonthLabel(point.month)}: ${point.activity}`
                            : undefined
                        }
                      />
                    </div>
                  );
                },
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {t("landing.pulseActivityTrendHint")}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground">
              {t("landing.pulseGrowth")}
            </p>
            <svg
              viewBox="0 0 280 80"
              className="mt-2 h-24 w-full"
              role="img"
              aria-label={t("landing.pulseGrowth")}
            >
              <defs>
                <linearGradient id="hb-pulse-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--theme-forest)" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="var(--theme-forest)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={area}
                fill="url(#hb-pulse-fill)"
                className={reduced || !stats ? undefined : "hero-chart-fade"}
              />
              <polyline
                points={points || "0,72 280,72"}
                fill="none"
                stroke="var(--theme-forest)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={reduced || !stats ? undefined : "hero-chart-draw"}
              />
            </svg>
            <p className="mt-1 text-[11px] text-muted-foreground">{t("landing.pulseGrowthHint")}</p>
          </div>
        </div>

        {stats ? (
          <p className="border-t border-border px-4 py-3 text-[11px] leading-5 text-muted-foreground sm:px-5">
            {t("landing.pulseHomesLive", { count: stats.units })}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{suffix}</p>
    </div>
  );
}
