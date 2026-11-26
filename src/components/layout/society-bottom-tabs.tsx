"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Ellipsis,
  IdCard,
  LayoutDashboard,
  Megaphone,
  Receipt,
} from "lucide-react";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { fetchAttention } from "@/features/dashboard/api";
import type { AttentionCounts } from "@/features/dashboard/types";
import { countForNav } from "@/features/shell/attention";
import {
  isMobilePrimaryTab,
  mobileMoreNav,
  mobilePrimaryTabs,
  type MobilePrimaryTabKey,
} from "@/features/shell/mobile-primary-nav";
import {
  SOCIETY_NAV_ITEMS,
  societyNavKey,
} from "@/features/shell/nav-items";
import { requestSocietyNavOpen } from "@/features/shell/society-nav-events";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";

const TAB_ICONS: Record<MobilePrimaryTabKey, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  notices: Megaphone,
  visitors: IdCard,
  billing: Receipt,
};

type SocietyBottomTabsProps = {
  societyId: string;
  canManage: boolean;
  includeHousehold?: boolean;
};

export function SocietyBottomTabs({
  societyId,
  canManage,
  includeHousehold = true,
}: SocietyBottomTabsProps) {
  const pathname = usePathname();
  const { t } = useI18n();
  const active = societyNavKey(pathname, societyId);
  const tabs = mobilePrimaryTabs(canManage, { includeHousehold });
  const moreItems = mobileMoreNav(canManage, { includeHousehold });
  const counts = useAttentionCounts(societyId);
  const moreActive = !isMobilePrimaryTab(active);
  const moreCount = moreItems.reduce(
    (sum, item) => sum + countForNav(item.key, counts),
    0,
  );

  return (
    <nav
      aria-label={t("shell.appTabs")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] text-card-foreground md:hidden"
    >
      <ul className="grid h-14 grid-cols-5">
        {tabs.map((key) => {
          const item = SOCIETY_NAV_ITEMS.find((entry) => entry.key === key);
          if (!item) return null;
          const Icon = TAB_ICONS[key];
          const href = item.href(societyId);
          const selected = active === key;
          const count = countForNav(key, counts);
          const translated = t(`nav.${key}`);
          const label = translated === `nav.${key}` ? item.label : translated;
          return (
            <li key={key} className="min-w-0">
              <Link
                href={href}
                aria-current={selected ? "page" : undefined}
                aria-label={
                  count > 0 ? `${label} · ${t("nav.pending", { count })}` : label
                }
                className={`relative flex h-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium ${
                  selected
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="relative">
                  <Icon
                    aria-hidden
                    className="size-5"
                    strokeWidth={selected ? 2.2 : 1.8}
                  />
                  {count > 0 ? (
                    <span className="attention-chip absolute -right-3 -top-1.5 min-h-4 min-w-4 px-1 text-[9px] leading-none">
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </span>
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
        <li className="min-w-0">
          <button
            type="button"
            aria-controls="society-nav-drawer"
            aria-haspopup="dialog"
            aria-current={moreActive ? "page" : undefined}
            aria-label={
              moreCount > 0
                ? `${t("shell.more")} · ${t("nav.pending", { count: moreCount })}`
                : t("shell.more")
            }
            className={`relative flex h-full w-full flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium ${
              moreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => requestSocietyNavOpen()}
          >
            <span className="relative">
              <Ellipsis
                aria-hidden
                className="size-5"
                strokeWidth={moreActive ? 2.2 : 1.8}
              />
              {moreCount > 0 ? (
                <span className="attention-chip absolute -right-3 -top-1.5 min-h-4 min-w-4 px-1 text-[9px] leading-none">
                  {moreCount > 99 ? "99+" : moreCount}
                </span>
              ) : null}
            </span>
            <span className="truncate">{t("shell.more")}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

function useAttentionCounts(societyId: string): AttentionCounts | undefined {
  const query = useQuery({
    queryKey: ["attention", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchAttention(token, societyId);
    },
    staleTime: 30_000,
  });
  return query.data?.counts;
}
