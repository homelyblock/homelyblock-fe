import { apiRequest } from "@/services/api-client";
import type {
  CreateExpectedVisitorInput,
  CreateWalkInVisitorInput,
  PaginatedVisitors,
  Visitor,
  VisitorStatus,
} from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchVisitors(
  accessToken: string,
  societyId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: VisitorStatus;
    unitId?: string;
    from?: string;
    to?: string;
  },
): Promise<PaginatedVisitors> {
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 20),
  });
  if (options?.status) params.set("status", options.status);
  if (options?.unitId) params.set("unitId", options.unitId);
  if (options?.from) params.set("from", options.from);
  if (options?.to) params.set("to", options.to);

  const response = await apiRequest<DataEnvelope<PaginatedVisitors>>(
    `/api/v1/societies/${societyId}/visitors?${params.toString()}`,
    { accessToken },
  );
  return response.data;
}

export async function createExpectedVisitor(
  accessToken: string,
  societyId: string,
  input: CreateExpectedVisitorInput,
): Promise<Visitor> {
  const response = await apiRequest<DataEnvelope<Visitor>>(
    `/api/v1/societies/${societyId}/visitors/expected`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function createWalkInVisitor(
  accessToken: string,
  societyId: string,
  input: CreateWalkInVisitorInput,
): Promise<Visitor> {
  const response = await apiRequest<DataEnvelope<Visitor>>(
    `/api/v1/societies/${societyId}/visitors/walk-ins`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function fetchVisitor(
  accessToken: string,
  visitorId: string,
): Promise<Visitor> {
  const response = await apiRequest<DataEnvelope<Visitor>>(
    `/api/v1/visitors/${visitorId}`,
    { accessToken },
  );
  return response.data;
}

async function postVisitorAction(
  accessToken: string,
  visitorId: string,
  action: "approve" | "reject" | "cancel" | "check-in" | "check-out",
): Promise<Visitor> {
  const response = await apiRequest<DataEnvelope<Visitor>>(
    `/api/v1/visitors/${visitorId}/${action}`,
    { method: "POST", accessToken },
  );
  return response.data;
}

export const approveVisitor = (token: string, id: string) =>
  postVisitorAction(token, id, "approve");
export const rejectVisitor = (token: string, id: string) =>
  postVisitorAction(token, id, "reject");
export const cancelVisitor = (token: string, id: string) =>
  postVisitorAction(token, id, "cancel");
export const checkInVisitor = (token: string, id: string) =>
  postVisitorAction(token, id, "check-in");
export const checkOutVisitor = (token: string, id: string) =>
  postVisitorAction(token, id, "check-out");
