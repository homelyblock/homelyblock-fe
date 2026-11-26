"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { usePwaOptional } from "@/features/pwa/pwa-provider";
import { useI18n } from "@/i18n/provider";
import { userInitials } from "@/lib/user-initials";

type AccountMenuProps = {
  label: string;
  email?: string | null;
  signOutReturnTo?: "/sign-in" | "/admin/sign-in";
};

export function AccountMenu({
  label,
  email,
  signOutReturnTo = "/sign-in",
}: AccountMenuProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const pwa = usePwaOptional();
  const rootRef = useRef<HTMLDivElement>(null);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const initials = userInitials(label === email ? null : label, email);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenPath(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold tracking-wide text-foreground hover:bg-accent"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        title={label}
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        <span aria-hidden className="leading-none">
          {initials}
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="motion-rise absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-xl"
        >
          <div className="border-b border-border px-2 pb-2">
            <p className="truncate text-sm font-medium text-foreground">{label}</p>
            {email ? (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            ) : null}
          </div>
          <Link
            href="/societies"
            role="menuitem"
            className="mt-1 block rounded-md px-2 py-2 text-sm hover:bg-muted"
            onClick={() => setOpenPath(null)}
          >
            {t("nav.societies")}
          </Link>
          <Link
            href="/profile"
            role="menuitem"
            className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
            onClick={() => setOpenPath(null)}
          >
            {t("nav.profile")}
          </Link>
          {pwa?.canInstall ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                setOpenPath(null);
                void pwa.install();
              }}
            >
              {t("pwa.install")}
            </button>
          ) : null}
          <div className="mt-1 border-t border-border pt-2">
            <SignOutButton returnTo={signOutReturnTo} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
