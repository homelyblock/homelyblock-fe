import { apiRequest } from "@/services/api-client";
import type {
  CreateNoticeInput,
  Notice,
  NoticeReadership,
  NoticeStatus,
  PaginatedNotices,
  UpdateNoticeInput,
} from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchNotices(
  accessToken: string,
  societyId: string,
  options?: { page?: number; limit?: number; status?: NoticeStatus },
): Promise<PaginatedNotices> {
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 20),
  });
  if (options?.status) {
    params.set("status", options.status);
  }
  const response = await apiRequest<DataEnvelope<PaginatedNotices>>(
    `/api/v1/societies/${societyId}/notices?${params.toString()}`,
    { accessToken },
  );
  return response.data;
}

export async function createNotice(
  accessToken: string,
  societyId: string,
  input: CreateNoticeInput,
): Promise<Notice> {
  const response = await apiRequest<DataEnvelope<Notice>>(
    `/api/v1/societies/${societyId}/notices`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function fetchNotice(
  accessToken: string,
  noticeId: string,
): Promise<Notice> {
  const response = await apiRequest<DataEnvelope<Notice>>(
    `/api/v1/notices/${noticeId}`,
    { accessToken },
  );
  return response.data;
}

export async function updateNotice(
  accessToken: string,
  noticeId: string,
  input: UpdateNoticeInput,
): Promise<Notice> {
  const response = await apiRequest<DataEnvelope<Notice>>(
    `/api/v1/notices/${noticeId}`,
    {
      method: "PATCH",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function publishNotice(
  accessToken: string,
  noticeId: string,
): Promise<Notice> {
  const response = await apiRequest<DataEnvelope<Notice>>(
    `/api/v1/notices/${noticeId}/publish`,
    { method: "POST", accessToken },
  );
  return response.data;
}

export async function archiveNotice(
  accessToken: string,
  noticeId: string,
): Promise<Notice> {
  const response = await apiRequest<DataEnvelope<Notice>>(
    `/api/v1/notices/${noticeId}/archive`,
    { method: "POST", accessToken },
  );
  return response.data;
}

export async function deleteNotice(
  accessToken: string,
  noticeId: string,
): Promise<{ id: string }> {
  const response = await apiRequest<DataEnvelope<{ id: string }>>(
    `/api/v1/notices/${noticeId}`,
    { method: "DELETE", accessToken },
  );
  return response.data;
}

export async function markNoticeRead(
  accessToken: string,
  noticeId: string,
): Promise<{ noticeId: string; readAt: string }> {
  const response = await apiRequest<
    DataEnvelope<{ noticeId: string; readAt: string }>
  >(`/api/v1/notices/${noticeId}/read`, { method: "POST", accessToken });
  return response.data;
}

export async function fetchNoticeReadership(
  accessToken: string,
  noticeId: string,
): Promise<NoticeReadership> {
  const response = await apiRequest<DataEnvelope<NoticeReadership>>(
    `/api/v1/notices/${noticeId}/readership`,
    { accessToken },
  );
  return response.data;
}
