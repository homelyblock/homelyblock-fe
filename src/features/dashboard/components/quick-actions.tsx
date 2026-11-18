import Link from "next/link";

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
          className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground shadow-sm hover:-translate-y-px hover:border-teal/40"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
