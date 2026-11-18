const LABELS: Record<string, string> = {
  societies: "Societies",
  new: "New",
  edit: "Edit",
  profile: "Profile",
  buildings: "Buildings",
  units: "Units",
  members: "Members",
  household: "Household",
  residents: "Residents",
  notices: "Notices",
  visitors: "Visitors",
  billing: "Billing",
  bills: "Bills",
  complaints: "Complaints",
  services: "Services",
  config: "Configuration",
  generate: "Generate",
  expected: "Expected visitor",
  "walk-in": "Walk-in",
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type BreadcrumbItem = {
  href: string;
  label: string;
};

function isUuid(value: string): boolean {
  return UUID.test(value);
}

export function breadcrumbItems(pathname: string): BreadcrumbItem[] {
  const parts = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];
  let href = "";

  parts.forEach((part, index) => {
    href += `/${part}`;
    if (isUuid(part)) {
      const previous = parts[index - 1];
      const label =
        previous === "societies"
          ? "Society"
          : previous === "bills"
            ? "Bill"
            : "Details";
      items.push({ href, label });
      return;
    }
    items.push({ href, label: LABELS[part] ?? part });
  });

  return items;
}
