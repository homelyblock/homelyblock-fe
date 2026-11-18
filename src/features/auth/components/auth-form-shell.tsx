import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";

type AuthFormShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
};

export function AuthFormShell({
  title,
  description,
  children,
  footer,
  wide = false,
}: AuthFormShellProps) {
  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.45),transparent_42%)]"
        />
        <Logo href="/" tone="inverse" />
        <div className="relative max-w-md space-y-6">
          <h2 className="text-4xl font-semibold tracking-tight">
            One platform for a better-managed society.
          </h2>
          <p className="text-sm leading-6 text-primary-foreground/80">
            Notices, visitors, maintenance records, complaints, and household details for the societies you are allowed to access.
          </p>
          <ul className="space-y-2 text-sm text-primary-foreground/85">
            <li>Role-based access for residents and administrators</li>
            <li>Society records kept in one workspace</li>
            <li>Usable from a phone or desktop browser</li>
          </ul>
        </div>
        <p className="relative text-sm text-primary-foreground/70">Residential society management</p>
      </section>
      <main id="main" className="flex flex-col justify-center bg-background px-6 py-12">
        <div
          className={`motion-rise mx-auto w-full rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8 ${wide ? "max-w-xl" : "max-w-md"}`}
        >
          <div className="mb-8 lg:hidden">
            <Logo href="/" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <div className="mt-8 space-y-6">{children}</div>
          {footer ? (
            <div className="mt-8 text-sm text-muted-foreground">{footer}</div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              <Link href="/" className="font-medium text-foreground underline-offset-4 hover:underline">
                Back to home
              </Link>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
