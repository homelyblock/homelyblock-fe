"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/provider";

type BackLinkProps = {
  href: string;
  labelKey: string;
};

export function BackLink({ href, labelKey }: BackLinkProps) {
  const { t } = useI18n();
  const translated = t(labelKey);
  const label = translated === labelKey ? labelKey : translated;

  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-muted"
    >
      <ArrowLeft aria-hidden className="size-4" />
      {t("common.backTo", { label })}
    </Link>
  );
}
