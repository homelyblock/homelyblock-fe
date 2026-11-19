import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/i18n/language-switcher";
import { AccountMenu } from "./account-menu";
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
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
        <Logo href="/societies" />
        <div className="hidden min-w-0 flex-1 md:block">
          <Breadcrumbs />
        </div>
        <div className="ml-auto flex items-center gap-2">
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
