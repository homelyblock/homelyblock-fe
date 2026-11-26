"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productNav } from "@/features/marketing/site-nav";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { useI18n } from "@/i18n/provider";

const LINK_KEYS: Record<string, string> = {
  "/features": "marketing.features",
  "/#solutions": "marketing.solutions",
  "/how-it-works": "marketing.how",
  "/faq": "marketing.faq",
  "/contact": "marketing.contact",
};

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        className="inline-flex h-11 items-center rounded-lg border border-border bg-muted px-3 text-sm font-medium text-foreground"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? t("marketing.closeMenu") : t("marketing.openMenu")}
        onClick={() => setOpen(true)}
      >
        {t("marketing.menu")}
      </button>
      {open ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--theme-overlay)]"
            aria-label={t("marketing.closeMenu")}
            onClick={() => setOpen(false)}
          />
          <nav
            id="mobile-nav"
            aria-label="Mobile"
            className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{t("marketing.menu")}</p>
              <button
                type="button"
                className="inline-flex h-10 items-center rounded-lg px-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {t("common.close")}
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <DrawerLink href="/" onClick={() => setOpen(false)}>
                {t("marketing.home")}
              </DrawerLink>
              {productNav.map((link) => (
                <DrawerLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {t(LINK_KEYS[link.href] ?? link.label)}
                </DrawerLink>
              ))}
            </div>
            <div className="mt-auto space-y-3 border-t border-border pt-4">
              <ThemeSwitcher />
              {signedIn ? (
                <Link
                  href="/societies"
                  className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-base font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
                  onClick={() => setOpen(false)}
                >
                  {t("marketing.openApp")}
                </Link>
              ) : (
                <div className="grid gap-2">
                  <Link
                    href="/sign-in"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-muted text-base font-medium text-foreground hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    {t("marketing.login")}
                  </Link>
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 items-center justify-center rounded-lg bg-primary text-base font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
                    onClick={() => setOpen(false)}
                  >
                    {t("marketing.getStarted")}
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </div>
  );
}

function DrawerLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: string;
  onClick: () => void;
}) {
  return (
    <Link href={href} className="rounded-lg px-3 py-3 text-base font-medium hover:bg-accent" onClick={onClick}>
      {children}
    </Link>
  );
}
