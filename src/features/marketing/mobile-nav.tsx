"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { productNav } from "@/features/marketing/site-nav";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/i18n/language-switcher";
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
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div>
      <button
        type="button"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground hover:bg-accent"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        aria-label={open ? t("marketing.closeMenu") : t("marketing.openMenu")}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? (
          <X aria-hidden className="size-5" strokeWidth={1.8} />
        ) : (
          <Menu aria-hidden className="size-5" strokeWidth={1.8} />
        )}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--theme-overlay)]"
            aria-label={t("marketing.closeMenu")}
            onClick={() => setOpen(false)}
          />
          <nav
            id={panelId}
            aria-label={t("marketing.menu")}
            className="absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l border-border bg-card pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-card-foreground shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{t("marketing.menu")}</p>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                aria-label={t("marketing.closeMenu")}
                onClick={() => setOpen(false)}
              >
                <X aria-hidden className="size-5" strokeWidth={1.8} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto bg-card p-3">
              <DrawerLink href="/" onClick={() => setOpen(false)}>
                {t("marketing.home")}
              </DrawerLink>
              {productNav.map((link) => (
                <DrawerLink key={link.href} href={link.href} onClick={() => setOpen(false)}>
                  {t(LINK_KEYS[link.href] ?? link.label)}
                </DrawerLink>
              ))}
            </div>
            <div className="space-y-3 border-t border-border bg-card p-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="min-w-0 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{t("language.label")}</p>
                  <LanguageSwitcher className="h-11 w-full max-w-none" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">{t("theme.label")}</p>
                  <ThemeSwitcher className="h-11 w-full max-w-none" />
                </div>
              </div>
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
    <Link
      href={href}
      className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
