"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchPlatformStats } from "@/features/marketing/platform-stats";
import { useI18n } from "@/i18n/provider";

export function PlatformProofStrip() {
  const { t } = useI18n();
  const query = useQuery({
    queryKey: ["platform-stats"],
    queryFn: fetchPlatformStats,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const loading = query.isLoading;
  const data = query.data;
  const items = [
    {
      value: loading ? "…" : String(data?.societies ?? "—"),
      label: t("landing.proofSocieties"),
    },
    {
      value: loading ? "…" : String(data?.memberships ?? "—"),
      label: t("landing.proofMemberships"),
    },
    {
      value: loading ? "…" : String(data?.units ?? "—"),
      label: t("landing.proofHomes"),
    },
    {
      value: loading ? "…" : String(data?.noticesPublished ?? "—"),
      label: t("landing.proofNotices"),
    },
    {
      value: loading ? "…" : String(data?.visitorsHandled ?? "—"),
      label: t("landing.proofVisitors"),
    },
    {
      value: loading ? "…" : String(data?.paymentsRecorded ?? "—"),
      label: t("landing.proofPayments"),
    },
  ];

  return (
    <section className="motion-hero-proof border-b border-border bg-card">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {t("landing.proofEyebrow")}
        </p>
        <ul className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.label}>
              <p className="text-3xl font-semibold tracking-tight tabular-nums text-primary sm:text-4xl">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
