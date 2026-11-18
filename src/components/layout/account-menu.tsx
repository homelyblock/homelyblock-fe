"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/features/auth/components/sign-out-button";

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
  const rootRef = useRef<HTMLDivElement>(null);
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

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
        className="flex h-9 max-w-48 items-center truncate rounded-lg border border-border px-3 text-sm font-medium"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpenPath(open ? null : pathname)}
      >
        {label}
      </button>
      {open ? (
        <div
          role="menu"
          className="motion-rise absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl"
        >
          {email ? (
            <p className="truncate px-2 py-1.5 text-xs text-muted-foreground">{email}</p>
          ) : null}
          <Link
            href="/societies"
            role="menuitem"
            className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
            onClick={() => setOpenPath(null)}
          >
            Societies
          </Link>
          <Link
            href="/profile"
            role="menuitem"
            className="block rounded-md px-2 py-2 text-sm hover:bg-muted"
            onClick={() => setOpenPath(null)}
          >
            Profile
          </Link>
          <div className="mt-1 border-t border-border pt-2">
            <SignOutButton returnTo={signOutReturnTo} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
