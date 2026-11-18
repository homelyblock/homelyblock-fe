import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/features/marketing/mobile-nav";
import { OpenCookiePreferences } from "@/features/marketing/cookie-consent";
import { readOperatorIdentity } from "@/features/marketing/operator";
import { footerLegalLinks, footerProductLinks, productNav } from "@/features/marketing/site-nav";

type SiteHeaderProps = {
  signedIn: boolean;
};

export function SiteHeader({ signedIn }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/" />
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          {productNav.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {signedIn ? (
            <Link
              href="/societies"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Open app
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden h-10 items-center rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted sm:inline-flex"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="hidden h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground sm:inline-flex"
              >
                Get started
              </Link>
            </>
          )}
          <MobileNav signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ signedIn = false }: { signedIn?: boolean }) {
  const operator = readOperatorIdentity();
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Logo href="/" tone="inverse" />
          <p className="text-sm leading-6 text-primary-foreground/80">
            Residential society management for residents and administrators.
          </p>
          <p className="text-sm leading-6 text-primary-foreground/80">
            {operator.legalName
              ? `${operator.legalName}${operator.address ? `, ${operator.address}` : ""}.`
              : "The operating organisation’s legal name and address are not published yet."}
          </p>
          <p className="text-sm text-primary-foreground/70">© 2026 LivingSpace</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Product</p>
          {footerProductLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block text-primary-foreground/80 hover:text-primary-foreground">
              {link.label}
            </Link>
          ))}
          {signedIn ? (
            <Link href="/societies" className="block text-primary-foreground/80 hover:text-primary-foreground">
              Open app
            </Link>
          ) : (
            <Link href="/sign-in" className="block text-primary-foreground/80 hover:text-primary-foreground">
              Login
            </Link>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">Legal</p>
          {footerLegalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block text-primary-foreground/80 hover:text-primary-foreground">
              {link.label}
            </Link>
          ))}
          <OpenCookiePreferences className="block text-left text-primary-foreground/80 hover:text-primary-foreground">
            Cookie preferences
          </OpenCookiePreferences>
        </div>
      </div>
    </footer>
  );
}

export function MarketingFrame({
  signedIn,
  children,
}: {
  signedIn: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader signedIn={signedIn} />
      <main id="main" className="min-w-0 flex-1">
        {children}
      </main>
      <SiteFooter signedIn={signedIn} />
    </div>
  );
}
