export type Building = {
  id: string;
  societyId: string;
  name: string;
  code: string;
  createdAt: string;
  updatedAt: string;
};

export type Unit = {
  id: string;
  societyId: string;
  buildingId: string;
  unitNumber: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
};

export type Membership = {
  id: string;
  societyId: string;
  userId: string;
  displayName: string;
  email?: string | null;
  role: "SOCIETY_ADMIN" | "RESIDENT_USER";
  status: "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
  primaryUnitId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBuildingInput = {
  name: string;
  code: string;
};

export type UpdateBuildingInput = Partial<CreateBuildingInput>;

export type CreateUnitInput = {
  buildingId: string;
  unitNumber: string;
  status?: "ACTIVE" | "INACTIVE";
};

export type UpdateUnitInput = {
  unitNumber?: string;
  status?: "ACTIVE" | "INACTIVE";
};

export type CreateMembershipInput = {
  userId: string;
  role: "SOCIETY_ADMIN" | "RESIDENT_USER";
  status?: "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
  primaryUnitId?: string;
};

export type UpdateMembershipInput = {
  role?: "SOCIETY_ADMIN" | "RESIDENT_USER";
  status?: "INVITED" | "ACTIVE" | "SUSPENDED" | "REMOVED";
  primaryUnitId?: string | null;
};
