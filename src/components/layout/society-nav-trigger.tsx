"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  isSocietyAppPath,
  requestSocietyNavOpen,
} from "@/features/shell/society-nav-events";
import { useI18n } from "@/i18n/provider";

export function SocietyNavTrigger() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (!isSocietyAppPath(pathname)) return null;

  return (
    <button
      type="button"
      className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground hover:bg-accent md:hidden"
      aria-controls="society-nav-drawer"
      aria-haspopup="dialog"
      aria-label={t("shell.openNav")}
      onClick={() => requestSocietyNavOpen()}
    >
      <Menu aria-hidden className="size-5" strokeWidth={1.8} />
    </button>
  );
}
