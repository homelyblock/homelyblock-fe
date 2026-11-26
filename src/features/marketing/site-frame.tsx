"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { MobileNav } from "@/features/marketing/mobile-nav";
import { OpenCookiePreferences } from "@/features/marketing/cookie-consent";
import { readOperatorIdentity } from "@/features/marketing/operator";
import {
  footerCompanyLinks,
  footerLegalLinks,
  footerProductLinks,
  footerSupportLinks,
  productNav,
} from "@/features/marketing/site-nav";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { useI18n } from "@/i18n/provider";

type SiteHeaderProps = {
  signedIn: boolean;
};

const MARKETING_KEYS: Record<string, string> = {
  "/features": "marketing.features",
  "/#solutions": "marketing.solutions",
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
    <header className="sticky top-0 z-30 border-b border-border bg-card pt-[env(safe-area-inset-top)] text-card-foreground">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-3 sm:px-6">
        <div className="min-w-0 shrink-0">
          <Logo href="/" />
        </div>

        {/* Website chrome: full nav on desktop. */}
        <nav
          aria-label={t("marketing.menu")}
          className="ml-2 hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto lg:gap-1 xl:gap-2 md:flex"
        >
          {productNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-foreground hover:bg-muted lg:px-3"
            >
              {marketingLabel(link.href, link.label, t)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex">
          <LanguageSwitcher className="max-w-28" />
          <ThemeSwitcher />
          {signedIn ? (
            <Link
              href="/societies"
              className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
            >
              {t("marketing.openApp")}
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg px-4 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t("marketing.login")}
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
              >
                {t("marketing.getStarted")}
              </Link>
            </>
          )}
        </div>

        {/* Phone / PWA: compact menu only. */}
        <div className="ml-auto md:hidden">
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
    <footer className="bg-forest text-forest-foreground">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="max-w-sm space-y-3">
          <Logo href="/" tone="inverse" />
          <p className="text-sm leading-6">{t("marketing.blurb")}</p>
          <p className="text-sm leading-6">
            {operator.legalName
              ? `${operator.legalName}${operator.address ? `, ${operator.address}` : ""}.`
              : t("marketing.operatorMissing")}
          </p>
          {operator.supportEmail ? (
            <p className="text-sm leading-6">
              {t("marketing.supportEmail")}{" "}
              <a className="underline underline-offset-4" href={`mailto:${operator.supportEmail}`}>
                {operator.supportEmail}
              </a>
            </p>
          ) : null}
          {operator.grievanceEmail ? (
            <p className="text-sm leading-6">
              {t("marketing.privacyContact")}{" "}
              <a className="underline underline-offset-4" href={`mailto:${operator.grievanceEmail}`}>
                {operator.grievanceEmail}
              </a>
            </p>
          ) : null}
          <p className="text-sm leading-6">{t("marketing.copyright")}</p>
        </div>
        <FooterColumn title={t("marketing.product")}>
          {footerProductLinks.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {marketingLabel(link.href, link.label, t)}
            </FooterLink>
          ))}
          {signedIn ? (
            <FooterLink href="/societies">{t("marketing.openApp")}</FooterLink>
          ) : (
            <FooterLink href="/sign-in">{t("marketing.login")}</FooterLink>
          )}
        </FooterColumn>
        <div className="space-y-8">
          <FooterColumn title={t("marketing.company")}>
            {footerCompanyLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {marketingLabel(link.href, link.label, t)}
              </FooterLink>
            ))}
          </FooterColumn>
          <FooterColumn title={t("marketing.support")}>
            {footerSupportLinks.map((link) => (
              <FooterLink key={link.href} href={link.href}>
                {marketingLabel(link.href, link.label, t)}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>
        <FooterColumn title={t("marketing.legal")}>
          {footerLegalLinks.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {marketingLabel(link.href, link.label, t)}
            </FooterLink>
          ))}
          <OpenCookiePreferences className="block text-left text-sm leading-6 hover:underline">
            {t("marketing.cookiePreferences")}
          </OpenCookiePreferences>
        </FooterColumn>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 text-sm leading-6">
      <p className="font-semibold">{title}</p>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <Link href={href} className="block hover:underline">
      {children}
    </Link>
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
