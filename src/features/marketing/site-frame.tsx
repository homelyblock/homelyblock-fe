"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
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
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
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
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo href="/" />
        <nav aria-label="Primary" className="hidden items-center gap-5 text-[15px] lg:flex">
          {productNav.map((link) => {
            const active = !link.href.startsWith("/#") && pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "font-medium text-foreground"
                    : "font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {marketingLabel(link.href, link.label, t)}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeSwitcher className="hidden sm:inline-flex" />
          <LanguageSwitcher />
          {signedIn ? (
            <Link
              href="/societies"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
            >
              {t("marketing.openApp")}
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-accent lg:inline-flex"
              >
                {t("marketing.login")}
              </Link>
              <Link
                href="/sign-up"
                className="hidden h-11 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)] lg:inline-flex"
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
