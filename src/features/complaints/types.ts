export type ComplaintCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "CLEANING"
  | "LIFT"
  | "SECURITY"
  | "PARKING"
  | "GENERAL"
  | "OTHER";

export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type ComplaintStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REOPENED";

export type Complaint = {
  id: string;
  societyId: string;
  buildingId: string;
  unitId: string;
  createdByUserId: string;
  assignedToUserId: string | null;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
  unitNumber?: string;
  buildingCode?: string;
  createdByDisplayName?: string;
  assignedToDisplayName?: string;
  statusHistory?: ComplaintStatusHistory[];
  comments?: ComplaintComment[];
  attachments?: ComplaintAttachment[];
};

export type ComplaintStatusHistory = {
  id: string;
  fromStatus: ComplaintStatus | null;
  toStatus: ComplaintStatus;
  changedByUserId: string;
  changedByDisplayName?: string;
  note: string | null;
  createdAt: string;
};

export type ComplaintComment = {
  id: string;
  complaintId: string;
  authorUserId: string;
  authorDisplayName?: string;
  body: string;
  createdAt: string;
};

export type ComplaintAttachment = {
  id: string;
  complaintId: string;
  uploadedByUserId: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

export type ComplaintDashboard = {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  highOrUrgent: number;
  byCategory: Array<{ category: ComplaintCategory; count: number }>;
  recent: Complaint[];
};

export type PaginatedComplaints = {
  items: Complaint[];
  page: number;
  limit: number;
  total: number;
};
