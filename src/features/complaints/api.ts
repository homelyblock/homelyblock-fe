import { getPublicConfig } from "@/config/public-env";
import { ApiError, apiRequest } from "@/services/api-client";
import type {
  Complaint,
  ComplaintAttachment,
  ComplaintCategory,
  ComplaintComment,
  ComplaintDashboard,
  ComplaintPriority,
  ComplaintStatus,
  PaginatedComplaints,
} from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchComplaints(
  accessToken: string,
  societyId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: ComplaintStatus;
    category?: ComplaintCategory;
    priority?: ComplaintPriority;
    buildingId?: string;
  },
): Promise<PaginatedComplaints> {
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 50),
  });
  if (options?.status) params.set("status", options.status);
  if (options?.category) params.set("category", options.category);
  if (options?.priority) params.set("priority", options.priority);
  if (options?.buildingId) params.set("buildingId", options.buildingId);
  const response = await apiRequest<DataEnvelope<PaginatedComplaints>>(
    `/api/v1/societies/${societyId}/complaints?${params.toString()}`,
    { accessToken },
  );
  return response.data;
}

export async function createComplaint(
  accessToken: string,
  societyId: string,
  input: {
    title: string;
    description: string;
    category: ComplaintCategory;
    priority?: ComplaintPriority;
  },
): Promise<Complaint> {
  const response = await apiRequest<DataEnvelope<Complaint>>(
    `/api/v1/societies/${societyId}/complaints`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function fetchComplaintDashboard(
  accessToken: string,
  societyId: string,
): Promise<ComplaintDashboard> {
  const response = await apiRequest<DataEnvelope<ComplaintDashboard>>(
    `/api/v1/societies/${societyId}/complaints/dashboard`,
    { accessToken },
  );
  return response.data;
}

export async function fetchComplaint(
  accessToken: string,
  complaintId: string,
): Promise<Complaint> {
  const response = await apiRequest<DataEnvelope<Complaint>>(
    `/api/v1/complaints/${complaintId}`,
    { accessToken },
  );
  return response.data;
}

async function postAction(
  accessToken: string,
  complaintId: string,
  action: string,
  body?: unknown,
): Promise<Complaint> {
  const response = await apiRequest<DataEnvelope<Complaint>>(
    `/api/v1/complaints/${complaintId}/${action}`,
    {
      method: "POST",
      accessToken,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  return response.data;
}

export const acknowledgeComplaint = (token: string, id: string) =>
  postAction(token, id, "acknowledge");
export const startComplaint = (token: string, id: string) =>
  postAction(token, id, "start");
export const closeComplaint = (token: string, id: string) =>
  postAction(token, id, "close");
export const assignComplaint = (
  token: string,
  id: string,
  assigneeUserId: string,
) => postAction(token, id, "assign", { assigneeUserId });
export const resolveComplaint = (
  token: string,
  id: string,
  resolutionNotes: string,
) => postAction(token, id, "resolve", { resolutionNotes });
export const reopenComplaint = (
  token: string,
  id: string,
  note?: string,
) => postAction(token, id, "reopen", { note });

export async function fetchComplaintComments(
  accessToken: string,
  complaintId: string,
): Promise<ComplaintComment[]> {
  const response = await apiRequest<
    DataEnvelope<{ items: ComplaintComment[] }>
  >(`/api/v1/complaints/${complaintId}/comments`, { accessToken });
  return response.data.items;
}

export async function addComplaintComment(
  accessToken: string,
  complaintId: string,
  body: string,
): Promise<ComplaintComment> {
  const response = await apiRequest<DataEnvelope<ComplaintComment>>(
    `/api/v1/complaints/${complaintId}/comments`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    },
  );
  return response.data;
}

export async function uploadComplaintAttachment(
  accessToken: string,
  complaintId: string,
  file: File,
): Promise<ComplaintAttachment> {
  if (file.size > 5 * 1024 * 1024) {
    throw new ApiError("Attachment must be 5MB or smaller", 400, "BAD_REQUEST");
  }
  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(file.type)) {
    throw new ApiError(
      "Only JPEG, PNG, or WebP images are allowed",
      415,
      "UNSUPPORTED_MEDIA_TYPE",
    );
  }

  const { apiUrl } = getPublicConfig();
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(
    new URL(`/api/v1/complaints/${complaintId}/attachments`, `${apiUrl}/`),
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    },
  );
  if (!response.ok) {
    let message = "Unable to upload attachment";
    try {
      const parsed = (await response.json()) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status);
  }
  const payload = (await response.json()) as DataEnvelope<ComplaintAttachment>;
  return payload.data;
}

export async function downloadComplaintAttachment(
  accessToken: string,
  attachmentId: string,
  filename: string,
): Promise<void> {
  const { apiUrl } = getPublicConfig();
  const response = await fetch(
    new URL(`/api/v1/complaint-attachments/${attachmentId}`, `${apiUrl}/`),
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok) {
    let message = "Unable to download attachment";
    try {
      const parsed = (await response.json()) as { message?: string };
      if (parsed.message) message = parsed.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, response.status);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename || "attachment";
    anchor.click();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
