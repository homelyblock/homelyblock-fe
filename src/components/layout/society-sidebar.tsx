"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { fetchAttention } from "@/features/dashboard/api";
import type { AttentionCounts } from "@/features/dashboard/types";
import { countForNav } from "@/features/shell/attention";
import {
  visibleSocietyNav,
  societyNavKey,
  type SocietyNavKey,
} from "@/features/shell/nav-items";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";

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
  const { t } = useI18n();
  const active = societyNavKey(pathname, societyId);
  const items = visibleSocietyNav(canManage, { includeHousehold });
  const counts = useAttentionCounts(societyId);
  const activeLabel =
    items.find((item) => item.key === active)?.label ?? t("common.sections");
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const open = menuPath === pathname;

  return (
    <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-14 md:flex md:h-[calc(100vh-3.5rem)] md:w-64 md:shrink-0 md:flex-col md:border-r md:border-b-0">
      <div className="px-4 py-4">
        <p className="text-xs font-medium tracking-wide text-sidebar-foreground/70 uppercase">
          {t("common.society")}
        </p>
        <p className="mt-1 truncate text-sm font-semibold">{societyName}</p>
      </div>
      <div className="px-3 pb-3 md:hidden">
        <button
          type="button"
          className="flex h-11 w-full items-center justify-between rounded-xl border border-sidebar-border bg-sidebar-accent px-3 text-sm font-medium"
          aria-expanded={open}
          aria-controls="society-nav"
          onClick={() => setMenuPath(open ? null : pathname)}
        >
          <span className="truncate">
            {t(`nav.${active}`) === `nav.${active}` ? activeLabel : t(`nav.${active}`)}
          </span>
          <span className="text-xs font-normal text-sidebar-foreground/70">
            {open ? t("common.close") : t("common.menu")}
          </span>
        </button>
        {open ? (
          <nav id="society-nav" aria-label={t("common.sections")} className="pt-2">
            <NavLinks
              items={items}
              societyId={societyId}
              active={active}
              counts={counts}
            />
          </nav>
        ) : null}
      </div>
      <nav aria-label={t("common.sections")} className="hidden flex-1 md:block">
        <NavLinks
          items={items}
          societyId={societyId}
          active={active}
          counts={counts}
        />
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

function useAttentionCounts(societyId: string): AttentionCounts | undefined {
  const queryClient = useQueryClient();
  useEffect(() => {
    function refresh() {
      void queryClient.invalidateQueries({ queryKey: ["attention", societyId] });
    }
    window.addEventListener("hb-attention-refresh", refresh);
    return () => window.removeEventListener("hb-attention-refresh", refresh);
  }, [queryClient, societyId]);

  const query = useQuery({
    queryKey: ["attention", societyId],
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchAttention(token, societyId);
    },
  });

  return query.data?.counts;
}

function NavLinks({
  items,
  societyId,
  active,
  counts,
}: {
  items: ReturnType<typeof visibleSocietyNav>;
  societyId: string;
  active: SocietyNavKey;
  counts: AttentionCounts | undefined;
}) {
  const { t } = useI18n();

  return (
    <ul className="flex flex-col gap-1 px-2 py-2">
      {items.map((item) => {
        const Icon = ICONS[item.key];
        const isActive = item.key === active;
        const count = countForNav(item.key, counts);
        const translated = t(`nav.${item.key}`);
        const label = translated === `nav.${item.key}` ? item.label : translated;
        return (
          <li key={item.key}>
            <Link
              href={item.href(societyId)}
              aria-current={isActive ? "page" : undefined}
              aria-label={count > 0 ? `${label}, ${t("nav.pending", { count })}` : label}
              className={
                isActive
                  ? "flex min-h-11 items-center gap-2.5 rounded-xl bg-sidebar-accent px-3 text-sm font-medium text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--theme-accent)]"
                  : "flex min-h-11 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              {count > 0 ? (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
