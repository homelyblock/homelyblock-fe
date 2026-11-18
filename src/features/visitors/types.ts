export type VisitorStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "CANCELLED"
  | "EXPIRED";

export type VisitorEntryType = "EXPECTED" | "WALK_IN";

export type Visitor = {
  id: string;
  societyId: string;
  buildingId: string;
  unitId: string;
  unitNumber?: string;
  buildingCode?: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  expectedAt: string;
  vehicleNumber: string | null;
  notes: string | null;
  entryType: VisitorEntryType;
  status: VisitorStatus;
  createdByUserId: string;
  decisionByUserId: string | null;
  decisionAt: string | null;
  checkedInAt: string | null;
  checkedOutAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedVisitors = {
  items: Visitor[];
  page: number;
  limit: number;
  total: number;
};

export type CreateExpectedVisitorInput = {
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  expectedAt: string;
  vehicleNumber?: string;
  notes?: string;
};

export type CreateWalkInVisitorInput = {
  unitId: string;
  visitorName: string;
  visitorPhone: string;
  purpose: string;
  expectedAt?: string;
  vehicleNumber?: string;
  notes?: string;
};
