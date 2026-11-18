export type SocietyStatus = "ACTIVE" | "ARCHIVED";
export type MembershipRole = "SOCIETY_ADMIN" | "RESIDENT_USER";

export type SocietyListItem = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  status: SocietyStatus;
  membershipRole: MembershipRole | null;
  createdAt: string;
  updatedAt: string;
};

export type SocietyDetail = {
  id: string;
  name: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city: string | null;
  state: string | null;
  postalCode?: string | null;
  status: SocietyStatus;
  membershipRole: MembershipRole | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedSocieties = {
  items: SocietyListItem[];
  page: number;
  limit: number;
  total: number;
  activeCount: number;
  archivedCount: number;
};

export type CreateSocietyInput = {
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  initialAdminUserId: string;
};

export type CreateSocietyResult = {
  society: SocietyDetail;
  initialAdminMembership: {
    id: string;
    societyId: string;
    userId: string;
    role: MembershipRole;
    status: string;
  };
};

export type MeResponse = {
  id: string;
  email: string | null;
  displayName: string;
  phone?: string | null;
  platformRole: "PLATFORM_OWNER" | null;
  accountType?: "SOCIETY_ADMIN" | "RESIDENT_USER" | null;
  memberships: Array<{
    id: string;
    role: MembershipRole;
    status: string;
    societyId: string;
    primaryUnitId?: string | null;
    society?: {
      id: string;
      name: string;
      status: string;
    };
  }>;
  createdAt?: string;
  updatedAt?: string;
};

export type UserSearchItem = {
  id: string;
  displayName: string;
  email: string | null;
};

export type UpdateSocietyInput = {
  name?: string;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  status?: SocietyStatus;
};
