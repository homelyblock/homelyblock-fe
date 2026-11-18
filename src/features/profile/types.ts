import type { MembershipRole } from "@/features/societies/types";

export type ProfileMembership = {
  id: string;
  role: MembershipRole;
  status: string;
  societyId: string;
  primaryUnitId: string | null;
  society: {
    id: string;
    name: string;
    status: string;
  };
};

export type Profile = {
  id: string;
  email: string | null;
  displayName: string;
  phone: string | null;
  platformRole: "PLATFORM_OWNER" | null;
  memberships: ProfileMembership[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateProfileInput = {
  displayName?: string;
  phone?: string | null;
};
