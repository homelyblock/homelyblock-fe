export const HOUSEHOLD_RELATIONSHIPS = [
  "SPOUSE",
  "CHILD",
  "PARENT",
  "SIBLING",
  "RELATIVE",
  "OTHER",
] as const;

export type HouseholdRelationship = (typeof HOUSEHOLD_RELATIONSHIPS)[number];

export type HouseholdMember = {
  id: string;
  membershipId: string;
  societyId: string;
  name: string;
  relationship: HouseholdRelationship;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OwnHousehold = {
  membershipId: string;
  societyId: string;
  primaryUnitId: string | null;
  items: HouseholdMember[];
};

export type HouseholdOccupancy = {
  membershipId: string;
  societyId: string;
  userId: string;
  displayName: string;
  email: string | null;
  role: string;
  status: string;
  primaryUnitId: string | null;
  primaryUnitNumber: string | null;
  buildingName: string | null;
  activeHouseholdCount: number;
  householdMembers: HouseholdMember[];
};

export type SocietyHouseholdsPage = {
  items: HouseholdOccupancy[];
  page: number;
  limit: number;
  total: number;
};

export type UnitHousehold = {
  unitId: string;
  societyId: string;
  unitNumber: string;
  buildingName: string;
  items: HouseholdOccupancy[];
};

export type HouseholdMemberInput = {
  name: string;
  relationship: HouseholdRelationship;
  phone?: string;
  email?: string;
};
