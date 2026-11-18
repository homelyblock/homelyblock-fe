import type { ReactNode } from "react";

export function LoadingSkeleton({ label }: { label: string }) {
  return (
    <div className="animate-pulse space-y-4" role="status" aria-label={label}>
      <div className="h-7 w-48 rounded-md bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-20 rounded-lg border border-border bg-muted"
          />
        ))}
      </div>
      <div className="h-28 rounded-lg border border-border bg-muted" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center shadow-sm">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function StatusPage({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="motion-rise w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium tracking-wide text-teal uppercase">{code}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        {children ? <div className="mt-6 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </main>
  );
}
