"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  DoorOpen,
  House,
  IdCard,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  Receipt,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import {
  visibleSocietyNav,
  societyNavKey,
  type SocietyNavKey,
} from "@/features/shell/nav-items";

const ICONS: Record<SocietyNavKey, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  buildings: Building2,
  units: DoorOpen,
  members: Users,
  household: House,
  residents: UserRound,
  notices: Megaphone,
  visitors: IdCard,
  billing: Receipt,
  complaints: MessageSquareWarning,
  services: Wrench,
};

type SocietySidebarProps = {
  societyId: string;
  societyName: string;
  canManage: boolean;
  includeHousehold?: boolean;
  userLabel: string;
  signOutReturnTo?: "/sign-in" | "/admin/sign-in";
};

export function SocietySidebar({
  societyId,
  societyName,
  canManage,
  includeHousehold = true,
  userLabel,
  signOutReturnTo = "/sign-in",
}: SocietySidebarProps) {
  const pathname = usePathname();
  const active = societyNavKey(pathname, societyId);
  const items = visibleSocietyNav(canManage, { includeHousehold });

  return (
    <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-14 md:flex md:h-[calc(100vh-3.5rem)] md:w-64 md:shrink-0 md:flex-col md:border-r md:border-b-0">
      <div className="px-4 py-4">
        <p className="text-xs font-medium tracking-wide text-sidebar-foreground/70 uppercase">
          Society
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{societyName}</p>
      </div>
      <details key={pathname} className="px-3 pb-3 md:hidden">
        <summary className="flex h-11 cursor-pointer list-none items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span>{items.find((item) => item.key === active)?.label ?? "Sections"}</span>
          <span className="text-xs font-normal text-sidebar-foreground/70">Menu</span>
        </summary>
        <NavLinks items={items} societyId={societyId} active={active} />
      </details>
      <nav aria-label="Society sections" className="hidden flex-1 md:block">
        <NavLinks items={items} societyId={societyId} active={active} />
      </nav>
      <div className="hidden border-t border-sidebar-border p-3 md:block">
        <p className="truncate px-2 text-xs text-sidebar-foreground/70">{userLabel}</p>
        <div className="mt-2">
          <SignOutButton appearance="sidebar" returnTo={signOutReturnTo} />
        </div>
      </div>
    </aside>
  );
}

function NavLinks({
  items,
  societyId,
  active,
}: {
  items: ReturnType<typeof visibleSocietyNav>;
  societyId: string;
  active: SocietyNavKey;
}) {
  return (
    <ul className="flex flex-col gap-1 px-2 py-2">
      {items.map((item) => {
        const Icon = ICONS[item.key];
        const isActive = item.key === active;
        return (
          <li key={item.key}>
            <Link
              href={item.href(societyId)}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex min-h-11 items-center gap-2.5 rounded-xl bg-sidebar-accent px-3 text-sm font-medium text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--theme-accent)]"
                  : "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
