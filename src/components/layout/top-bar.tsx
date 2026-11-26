"use client";

import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { isSocietyAppPath } from "@/features/shell/society-nav-events";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { AccountMenu } from "./account-menu";
import { AppLogo } from "./app-logo";
import { Breadcrumbs } from "./breadcrumbs";
import { SocietyContextLabel } from "./society-context-label";

type TopBarProps = {
  email?: string | null;
  displayName?: string | null;
  signOutReturnTo?: "/sign-in" | "/admin/sign-in";
};

export function TopBar({
  email,
  displayName,
  signOutReturnTo = "/sign-in",
}: TopBarProps) {
  const pathname = usePathname();
  const label = displayName || email || "Account";
  const societyApp = isSocietyAppPath(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card pt-[env(safe-area-inset-top)] text-card-foreground">
      <div className="flex h-14 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <AppLogo />
          </div>
          {/* Phone / PWA app chrome: society name beside the mark. */}
          {societyApp ? <SocietyContextLabel /> : null}
        </div>
        {/* Website chrome: breadcrumbs on desktop. */}
        <div className="hidden min-w-0 flex-1 md:block">
          <Breadcrumbs />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Website tools stay in the bar on desktop; phone / PWA keep them in the account menu. */}
          <div className="hidden items-center gap-1.5 md:flex">
            <ThemeSwitcher />
            <LanguageSwitcher className="max-w-28" />
          </div>
          <AccountMenu label={label} email={email} signOutReturnTo={signOutReturnTo} />
        </div>
      </div>
    </header>
  );
}
