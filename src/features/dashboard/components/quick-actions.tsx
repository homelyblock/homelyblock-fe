"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/provider";

type QuickActionsProps = {
  societyId: string;
  actions: string[];
  catalog: Record<string, { href: (id: string) => string; label: string }>;
};

export function QuickActions({
  societyId,
  actions,
  catalog,
}: QuickActionsProps) {
  const { t } = useI18n();
  const items = actions
    .map((key) => {
      const entry = catalog[key];
      if (!entry) return null;
      return { key, ...entry };
    })
    .filter((item): item is { key: string; href: (id: string) => string; label: string } =>
      Boolean(item),
    );

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href(societyId)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-primary/30 hover:bg-accent"
        >
          {t(`actions.${item.key}`) === `actions.${item.key}`
            ? item.label
            : t(`actions.${item.key}`)}
        </Link>
      ))}
    </div>
  );
}
