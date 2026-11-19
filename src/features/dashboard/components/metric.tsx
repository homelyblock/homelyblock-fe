import Link from "next/link";
import type { ReactNode } from "react";

type MetricProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function Metric({ label, value, hint }: MetricProps) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

type SectionProps = {
  title: string;
  action?: { href: string; label: string };
  children: ReactNode;
};

export function DashboardSection({ title, action, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        {action ? (
          <Link href={action.href} className="text-sm font-medium text-primary hover:underline">
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function RecordLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground hover:bg-muted/50"
    >
      {children}
    </Link>
  );
}
