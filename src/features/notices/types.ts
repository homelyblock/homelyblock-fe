export type NoticeCategory =
  | "GENERAL"
  | "MAINTENANCE"
  | "EVENT"
  | "EMERGENCY"
  | "IMPORTANT";

export type NoticeAudienceType = "SOCIETY" | "BUILDING" | "UNIT";

export type NoticeStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type Notice = {
  id: string;
  societyId: string;
  title: string;
  body: string;
  category: NoticeCategory;
  audienceType: NoticeAudienceType;
  targetBuildingId: string | null;
  targetUnitId: string | null;
  status: NoticeStatus;
  createdByUserId: string;
  createdByDisplayName?: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isRead?: boolean;
  readAt?: string | null;
};

export type PaginatedNotices = {
  items: Notice[];
  page: number;
  limit: number;
  total: number;
};

export type NoticeReadership = {
  noticeId: string;
  eligibleRecipients: number;
  readCount: number;
  unreadCount: number;
  readPercentage: number;
};

export type CreateNoticeInput = {
  title: string;
  body: string;
  category?: NoticeCategory;
  audienceType?: NoticeAudienceType;
  targetBuildingId?: string;
  targetUnitId?: string;
};

export type UpdateNoticeInput = {
  title?: string;
  body?: string;
  category?: NoticeCategory;
  audienceType?: NoticeAudienceType;
  targetBuildingId?: string | null;
  targetUnitId?: string | null;
};
