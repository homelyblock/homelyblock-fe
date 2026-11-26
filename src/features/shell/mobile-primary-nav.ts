import type { SocietyNavKey } from "./nav-items.ts";
import { visibleSocietyNav } from "./nav-items.ts";

/** Primary destinations shown as bottom tabs on phone / PWA. */
export const MOBILE_PRIMARY_TAB_KEYS = [
  "overview",
  "notices",
  "visitors",
  "billing",
] as const satisfies readonly SocietyNavKey[];

export type MobilePrimaryTabKey = (typeof MOBILE_PRIMARY_TAB_KEYS)[number];

export function isMobilePrimaryTab(key: SocietyNavKey): key is MobilePrimaryTabKey {
  return (MOBILE_PRIMARY_TAB_KEYS as readonly string[]).includes(key);
}

export function mobilePrimaryTabs(
  canManage: boolean,
  options?: { includeHousehold?: boolean },
) {
  const visible = new Set(
    visibleSocietyNav(canManage, options).map((item) => item.key),
  );
  return MOBILE_PRIMARY_TAB_KEYS.filter((key) => visible.has(key));
}

/** Nav keys that live behind the More sheet on phone. */
export function mobileMoreNav(
  canManage: boolean,
  options?: { includeHousehold?: boolean },
) {
  return visibleSocietyNav(canManage, options).filter(
    (item) => !isMobilePrimaryTab(item.key),
  );
}
