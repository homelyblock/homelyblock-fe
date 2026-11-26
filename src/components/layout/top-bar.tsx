import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { AccountMenu } from "./account-menu";
import { AppLogo } from "./app-logo";
import { Breadcrumbs } from "./breadcrumbs";

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
  const label = displayName || email || "Account";

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card pt-[env(safe-area-inset-top)] backdrop-blur-md supports-[backdrop-filter]:bg-card/95">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <AppLogo />
        <div className="hidden min-w-0 flex-1 md:block">
          <Breadcrumbs />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSwitcher className="hidden sm:inline-flex" />
          <LanguageSwitcher />
          <AccountMenu label={label} email={email} signOutReturnTo={signOutReturnTo} />
        </div>
      </div>
      <div className="border-t border-border px-4 py-2 md:hidden">
        <Breadcrumbs />
      </div>
    </header>
  );
}
