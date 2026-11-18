import type { DashboardActivityItem } from "./types";

export function activityHref(
  societyId: string,
  item: DashboardActivityItem,
): string | null {
  const hint = item.hrefHint;
  if (!hint) return null;
  if (hint.startsWith("notice:")) {
    return `/societies/${societyId}/notices/${hint.slice("notice:".length)}`;
  }
  if (hint.startsWith("complaint:")) {
    return `/societies/${societyId}/complaints/${hint.slice("complaint:".length)}`;
  }
  if (hint.startsWith("visitor:")) {
    return `/societies/${societyId}/visitors/${hint.slice("visitor:".length)}`;
  }
  if (hint.startsWith("bill:")) {
    return `/societies/${societyId}/billing/bills/${hint.slice("bill:".length)}`;
  }
  if (hint === "billing") return `/societies/${societyId}/billing`;
  if (hint === "members") return `/societies/${societyId}/members`;
  return null;
}

export const RESIDENT_ACTION_LINKS: Record<
  string,
  { href: (id: string) => string; label: string }
> = {
  create_expected_visitor: {
    href: (id) => `/societies/${id}/visitors/expected`,
    label: "Create expected visitor",
  },
  submit_complaint: {
    href: (id) => `/societies/${id}/complaints/new`,
    label: "Submit complaint",
  },
  view_notices: {
    href: (id) => `/societies/${id}/notices`,
    label: "View notices",
  },
  view_bills: {
    href: (id) => `/societies/${id}/billing`,
    label: "View maintenance bills",
  },
  manage_household: {
    href: (id) => `/societies/${id}/household`,
    label: "Manage household",
  },
};

export const ADMIN_ACTION_LINKS: Record<
  string,
  { href: (id: string) => string; label: string }
> = {
  add_resident: {
    href: (id) => `/societies/${id}/members`,
    label: "Add resident",
  },
  add_building_unit: {
    href: (id) => `/societies/${id}/buildings`,
    label: "Add building / unit",
  },
  create_notice: {
    href: (id) => `/societies/${id}/notices/new`,
    label: "Create notice",
  },
  generate_bills: {
    href: (id) => `/societies/${id}/billing/generate`,
    label: "Generate maintenance bills",
  },
  view_complaints: {
    href: (id) => `/societies/${id}/complaints`,
    label: "View complaints",
  },
  view_visitors: {
    href: (id) => `/societies/${id}/visitors`,
    label: "View visitors",
  },
};

export function formatMoney(value: string): string {
  return `₹${value}`;
}
