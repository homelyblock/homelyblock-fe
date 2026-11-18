export const SOCIETY_NAV_ITEMS = [
  {
    key: "overview",
    href: (id: string) => `/societies/${id}`,
    label: "Overview",
    adminOnly: false,
  },
  {
    key: "buildings",
    href: (id: string) => `/societies/${id}/buildings`,
    label: "Buildings",
    adminOnly: true,
  },
  {
    key: "units",
    href: (id: string) => `/societies/${id}/units`,
    label: "Units",
    adminOnly: true,
  },
  {
    key: "members",
    href: (id: string) => `/societies/${id}/members`,
    label: "Members",
    adminOnly: true,
  },
  {
    key: "household",
    href: (id: string) => `/societies/${id}/household`,
    label: "Household",
    adminOnly: false,
  },
  {
    key: "residents",
    href: (id: string) => `/societies/${id}/residents`,
    label: "Residents",
    adminOnly: true,
  },
  {
    key: "notices",
    href: (id: string) => `/societies/${id}/notices`,
    label: "Notices",
    adminOnly: false,
  },
  {
    key: "visitors",
    href: (id: string) => `/societies/${id}/visitors`,
    label: "Visitors",
    adminOnly: false,
  },
  {
    key: "billing",
    href: (id: string) => `/societies/${id}/billing`,
    label: "Billing",
    adminOnly: false,
  },
  {
    key: "complaints",
    href: (id: string) => `/societies/${id}/complaints`,
    label: "Complaints",
    adminOnly: false,
  },
  {
    key: "services",
    href: (id: string) => `/societies/${id}/services`,
    label: "Services",
    adminOnly: false,
  },
] as const;

export type SocietyNavKey = (typeof SOCIETY_NAV_ITEMS)[number]["key"];

export function visibleSocietyNav(
  canManage: boolean,
  options?: { includeHousehold?: boolean },
) {
  const includeHousehold = options?.includeHousehold !== false;
  return SOCIETY_NAV_ITEMS.filter((item) => {
    if (!canManage && item.adminOnly) return false;
    if (item.key === "household" && !includeHousehold) return false;
    return true;
  });
}

export function societyNavKey(
  pathname: string,
  societyId: string,
): SocietyNavKey {
  const base = `/societies/${societyId}`;
  if (pathname === base) return "overview";
  const section = pathname.slice(base.length + 1).split("/")[0];
  const match = SOCIETY_NAV_ITEMS.find((item) => item.key === section);
  return match?.key ?? "overview";
}
