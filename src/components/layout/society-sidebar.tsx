"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Building2,
  DoorOpen,
  House,
  IdCard,
  LayoutDashboard,
  Megaphone,
  MessageSquareWarning,
  PanelLeft,
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
  NAV_GROUPS,
  visibleSocietyNav,
  societyNavKey,
  type NavGroup,
  type SocietyNavKey,
} from "@/features/shell/nav-items";
import { SOCIETY_NAV_OPEN_EVENT } from "@/features/shell/society-nav-events";
import { fetchSocieties } from "@/features/societies/api";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";

const SIDEBAR_EVENT = "hb-sidebar-collapsed-change";

function subscribeSidebar(onChange: () => void) {
  window.addEventListener(SIDEBAR_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(SIDEBAR_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function sidebarCollapsed() {
  return window.localStorage.getItem("hb-sidebar-collapsed") === "1";
}

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

const GROUP_LABEL: Record<Exclude<NavGroup, "overview">, string> = {
  community: "nav.groupCommunity",
  communication: "nav.groupCommunication",
  operations: "nav.groupOperations",
  finance: "nav.groupFinance",
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
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const collapsed = useSyncExternalStore(subscribeSidebar, sidebarCollapsed, () => false);

  useEffect(() => {
    function onOpenRequest() {
      setOpenPath(pathname);
    }
    window.addEventListener(SOCIETY_NAV_OPEN_EVENT, onOpenRequest);
    return () => window.removeEventListener(SOCIETY_NAV_OPEN_EVENT, onOpenRequest);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenPath(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function toggleCollapsed() {
    window.localStorage.setItem("hb-sidebar-collapsed", collapsed ? "0" : "1");
    window.dispatchEvent(new Event(SIDEBAR_EVENT));
  }

  const nav = (
    <NavLinks
      items={items}
      societyId={societyId}
      active={active}
      counts={counts}
      collapsed={collapsed}
      onNavigate={() => setOpenPath(null)}
    />
  );

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--theme-overlay)]"
            aria-label={t("shell.closeNav")}
            onClick={() => setOpenPath(null)}
          />
          <div
            id="society-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={t("common.sections")}
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-sidebar-border bg-sidebar pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] text-sidebar-foreground shadow-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3">
              <p className="text-sm font-semibold">{t("common.sections")}</p>
              <button
                type="button"
                className="inline-flex h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-sidebar-accent"
                onClick={() => setOpenPath(null)}
              >
                {t("common.close")}
              </button>
            </div>
            <div className="border-b border-sidebar-border bg-sidebar px-3 py-3">
              <SocietySwitcher societyId={societyId} societyName={societyName} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-sidebar">{nav}</div>
          </div>
        </div>
      ) : null}
      <aside
        className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex ${
          collapsed ? "md:w-[4.5rem]" : "md:w-60"
        }`}
      >
        <div className={`border-b border-sidebar-border ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
          {collapsed ? (
            <button
              type="button"
              title={t("shell.expand")}
              aria-label={t("shell.expand")}
              className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold hover:bg-sidebar-accent"
              onClick={toggleCollapsed}
            >
              HB
            </button>
          ) : (
            <SocietySwitcher societyId={societyId} societyName={societyName} />
          )}
        </div>
        <nav aria-label={t("common.sections")} className="min-h-0 flex-1 overflow-y-auto">
          {nav}
        </nav>
        <div className="border-t border-sidebar-border p-2">
          <button
            type="button"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={toggleCollapsed}
            aria-pressed={collapsed}
          >
            <PanelLeft aria-hidden className="size-4" />
            {collapsed ? <span className="sr-only">{t("shell.expand")}</span> : <span>{t("shell.collapse")}</span>}
          </button>
          {collapsed ? null : (
            <>
              <p className="truncate px-2 pt-2 text-xs text-muted-foreground">{userLabel}</p>
              <div className="mt-2">
                <SignOutButton appearance="sidebar" returnTo={signOutReturnTo} />
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function SocietySwitcher({
  societyId,
  societyName,
}: {
  societyId: string;
  societyName: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const query = useQuery({
    queryKey: ["societies", "switcher"],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchSocieties(token, 1, 50);
    },
  });

  const items = query.data?.items ?? [];
  const known = items.some((item) => item.id === societyId);
  if (!query.data || items.length < 2) {
    return (
      <div className="min-w-0 px-1">
        <p className="text-xs font-medium text-muted-foreground">{t("common.society")}</p>
        <p className="truncate text-sm font-semibold">{societyName}</p>
      </div>
    );
  }

  return (
    <label className="block min-w-0">
      <span className="px-1 text-xs font-medium text-muted-foreground">{t("shell.switchSociety")}</span>
      <select
        className="mt-1 h-10 w-full truncate rounded-lg border border-sidebar-border bg-card px-2 text-sm font-medium text-foreground"
        value={societyId}
        aria-label={t("shell.switchSociety")}
        onChange={(event) => {
          router.push(`/societies/${event.target.value}`);
        }}
      >
        {known ? null : <option value={societyId}>{societyName}</option>}
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      {query.data.total > items.length ? (
        <Link href="/societies" className="mt-1 block px-1 text-xs font-medium text-primary hover:underline">
          {t("shell.allSocieties")}
        </Link>
      ) : null}
    </label>
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
  collapsed,
  onNavigate,
}: {
  items: ReturnType<typeof visibleSocietyNav>;
  societyId: string;
  active: SocietyNavKey;
  counts: AttentionCounts | undefined;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4 px-2 py-3">
      {NAV_GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.group === group);
        if (groupItems.length === 0) return null;
        const labelKey = group === "overview" ? null : GROUP_LABEL[group];
        return (
          <div key={group}>
            {labelKey && !collapsed ? (
              <p className="mb-1 flex items-center gap-2 px-3 text-[11px] font-semibold tracking-[0.14em] text-[var(--sidebar-heading)] uppercase">
                <span aria-hidden className="h-3 w-0.5 rounded-full bg-[var(--sidebar-heading)]" />
                {t(labelKey)}
              </p>
            ) : null}
            <ul className="flex flex-col gap-0.5">
              {groupItems.map((item) => {
                const Icon = ICONS[item.key];
                const isActive = item.key === active;
                const count = countForNav(item.key, counts);
                const translated = t(`nav.${item.key}`);
                const label = translated === `nav.${item.key}` ? item.label : translated;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href(societyId)}
                      title={collapsed ? label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={count > 0 ? `${label}, ${t("nav.pending", { count })}` : label}
                      onClick={onNavigate}
                      className={
                        isActive
                          ? "relative flex min-h-10 items-center gap-2.5 rounded-lg bg-sidebar-accent px-3 text-sm font-semibold text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--theme-nav-indicator)]"
                          : "relative flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }
                    >
                      <Icon aria-hidden className="size-4 shrink-0" />
                      {collapsed ? (
                        count > 0 ? (
                          <span className="sr-only">{count}</span>
                        ) : null
                      ) : (
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                      )}
                      {!collapsed && count > 0 ? (
                        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                          {count > 99 ? "99+" : count}
                        </span>
                      ) : null}
                      {collapsed && count > 0 ? (
                        <span className="absolute ml-6 size-1.5 rounded-full bg-primary" aria-hidden />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
