import type { MeResponse } from "@/features/societies/types";

export function canManageSociety(me: MeResponse, societyId: string): boolean {
  if (me.platformRole === "PLATFORM_OWNER") return true;
  return me.memberships.some(
    (membership) =>
      membership.societyId === societyId &&
      membership.role === "SOCIETY_ADMIN" &&
      membership.status === "ACTIVE",
  );
}

export function hasActiveSocietyMembership(
  me: MeResponse,
  societyId: string,
): boolean {
  return me.memberships.some(
    (membership) =>
      membership.societyId === societyId && membership.status === "ACTIVE",
  );
}

export function canViewSociety(me: MeResponse, societyId: string): boolean {
  if (me.platformRole === "PLATFORM_OWNER") return true;
  return me.memberships.some(
    (membership) =>
      membership.societyId === societyId && membership.status === "ACTIVE",
  );
}

/**
 * Where to send someone who opened an admin directory directly.
 * Active residents return to their society overview. Everyone else
 * who cannot administer the society goes to the forbidden page.
 */
export function directoryAccessRedirect(
  me: MeResponse,
  societyId: string,
): string | null {
  if (canManageSociety(me, societyId)) return null;
  if (canViewSociety(me, societyId)) return `/societies/${societyId}`;
  return "/forbidden";
}
