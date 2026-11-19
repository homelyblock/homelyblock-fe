"use client";

import Link from "next/link";
import { useState } from "react";
import { productNav } from "@/features/marketing/site-nav";
import { useI18n } from "@/i18n/provider";

const LINK_KEYS: Record<string, string> = {
  "/features": "marketing.features",
  "/how-it-works": "marketing.how",
  "/faq": "marketing.faq",
  "/contact": "marketing.contact",
};

export function MobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="relative lg:hidden">
      <button
        type="button"
        className="relative z-30 flex h-10 items-center rounded-xl border border-border bg-card px-3 text-sm font-medium"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? t("marketing.closeMenu") : t("marketing.openMenu")}
        onClick={() => setOpen((current) => !current)}
      >
        {t("marketing.menu")}
      </button>
      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Mobile"
          className="absolute right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-sm"
        >
          <Link href="/" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
            {t("marketing.home")}
          </Link>
          {productNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {t(LINK_KEYS[link.href] ?? link.label)}
            </Link>
          ))}
          <Link href="/help" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
            {t("marketing.help")}
          </Link>
          {signedIn ? (
            <Link href="/societies" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
              {t("marketing.openApp")}
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                {t("marketing.login")}
              </Link>
              <Link href="/sign-up" className="block rounded-md px-3 py-2 text-sm hover:bg-muted" onClick={() => setOpen(false)}>
                {t("marketing.getStarted")}
              </Link>
            </>
          )}
        </nav>
      ) : null}
    </div>
  );
}
