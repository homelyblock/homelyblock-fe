"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { MobileNav } from "@/features/marketing/mobile-nav";
import { OpenCookiePreferences } from "@/features/marketing/cookie-consent";
import { readOperatorIdentity } from "@/features/marketing/operator";
import { footerLegalLinks, footerProductLinks, productNav } from "@/features/marketing/site-nav";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useI18n } from "@/i18n/provider";

type SiteHeaderProps = {
  signedIn: boolean;
};

const MARKETING_KEYS: Record<string, string> = {
  "/features": "marketing.features",
  "/how-it-works": "marketing.how",
  "/faq": "marketing.faq",
  "/contact": "marketing.contact",
  "/about": "marketing.about",
  "/help": "marketing.help",
  "/privacy-policy": "marketing.privacy",
  "/terms": "marketing.terms",
  "/cookies": "marketing.cookies",
  "/acceptable-use": "marketing.acceptable",
  "/security": "marketing.security",
  "/accessibility": "marketing.accessibility",
};

function marketingLabel(href: string, fallback: string, t: (key: string) => string) {
  const key = MARKETING_KEYS[href];
  if (!key) return fallback;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function SiteHeader({ signedIn }: SiteHeaderProps) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/" />
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-muted-foreground lg:flex">
          <Link href="/" className="hover:text-foreground">
            {t("marketing.home")}
          </Link>
          {productNav.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {marketingLabel(link.href, link.label, t)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {signedIn ? (
            <Link
              href="/societies"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              {t("marketing.openApp")}
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden h-10 items-center rounded-xl px-3 text-sm font-medium text-foreground hover:bg-muted sm:inline-flex"
              >
                {t("marketing.login")}
              </Link>
              <Link
                href="/sign-up"
                className="hidden h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground sm:inline-flex"
              >
                {t("marketing.getStarted")}
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
  const { t } = useI18n();
  const operator = readOperatorIdentity();
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Logo href="/" tone="inverse" />
          <p className="text-sm leading-6 text-primary-foreground/80">
            {t("marketing.blurb")}
          </p>
          <p className="text-sm leading-6 text-primary-foreground/80">
            {operator.legalName
              ? `${operator.legalName}${operator.address ? `, ${operator.address}` : ""}.`
              : t("marketing.operatorMissing")}
          </p>
          <p className="text-sm text-primary-foreground/70">{t("marketing.copyright")}</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{t("marketing.product")}</p>
          {footerProductLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block text-primary-foreground/80 hover:text-primary-foreground">
              {marketingLabel(link.href, link.label, t)}
            </Link>
          ))}
          {signedIn ? (
            <Link href="/societies" className="block text-primary-foreground/80 hover:text-primary-foreground">
              {t("marketing.openApp")}
            </Link>
          ) : (
            <Link href="/sign-in" className="block text-primary-foreground/80 hover:text-primary-foreground">
              {t("marketing.login")}
            </Link>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-medium">{t("marketing.legal")}</p>
          {footerLegalLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block text-primary-foreground/80 hover:text-primary-foreground">
              {marketingLabel(link.href, link.label, t)}
            </Link>
          ))}
          <OpenCookiePreferences className="block text-left text-primary-foreground/80 hover:text-primary-foreground">
            {t("marketing.cookiePreferences")}
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
