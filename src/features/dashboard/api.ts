import { apiRequest } from "@/services/api-client";
import type { AdminDashboard, ResidentDashboard } from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchResidentDashboard(
  accessToken: string,
  societyId: string,
): Promise<ResidentDashboard> {
  const response = await apiRequest<DataEnvelope<ResidentDashboard>>(
    `/api/v1/societies/${societyId}/dashboard/resident`,
    { accessToken },
  );
  return response.data;
}

export async function fetchAdminDashboard(
  accessToken: string,
  societyId: string,
  period?: { periodYear?: number; periodMonth?: number },
): Promise<AdminDashboard> {
  const params = new URLSearchParams();
  if (period?.periodYear) params.set("periodYear", String(period.periodYear));
  if (period?.periodMonth) params.set("periodMonth", String(period.periodMonth));
  const qs = params.toString();
  const response = await apiRequest<DataEnvelope<AdminDashboard>>(
    `/api/v1/societies/${societyId}/dashboard/admin${qs ? `?${qs}` : ""}`,
    { accessToken },
  );
  return response.data;
}
