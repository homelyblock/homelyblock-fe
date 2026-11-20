"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";

export function wrongSocietyHref(societyId: string, suffix: string): string {
  return `/societies/${societyId}${suffix}`;
}

export function WrongSocietyNotice({ href }: { href: string }) {
  const { t } = useI18n();
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card px-4 py-4">
      <p className="text-sm text-foreground">{t("work.differentSociety")}</p>
      <Link href={href} className={buttonVariants({ variant: "outline" })}>
        {t("work.openInSociety")}
      </Link>
    </div>
  );
}
