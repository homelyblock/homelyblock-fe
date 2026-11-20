import { getPublicConfig } from "@/config/public-env";
import { ApiError, apiRequest, redirectIfSessionExpired } from "@/services/api-client";
import type {
  Bill,
  BillingDashboard,
  MaintenanceConfig,
  PaginatedBills,
  Payment,
} from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchMaintenanceConfigs(
  accessToken: string,
  societyId: string,
): Promise<MaintenanceConfig[]> {
  const response = await apiRequest<
    DataEnvelope<{ items: MaintenanceConfig[] }>
  >(`/api/v1/societies/${societyId}/maintenance-configs`, { accessToken });
  return response.data.items;
}

export async function createMaintenanceConfig(
  accessToken: string,
  societyId: string,
  input: {
    name: string;
    monthlyAmount: string;
    dueDayOfMonth: number;
    description?: string;
    additionalAmount?: string;
    additionalDescription?: string;
  },
): Promise<MaintenanceConfig> {
  const response = await apiRequest<DataEnvelope<MaintenanceConfig>>(
    `/api/v1/societies/${societyId}/maintenance-configs`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateMaintenanceConfig(
  accessToken: string,
  configId: string,
  input: Partial<{
    name: string;
    description: string | null;
    monthlyAmount: string;
    dueDayOfMonth: number;
    additionalAmount: string;
    additionalDescription: string | null;
    status: "ACTIVE" | "INACTIVE";
  }>,
): Promise<MaintenanceConfig> {
  const response = await apiRequest<DataEnvelope<MaintenanceConfig>>(
    `/api/v1/maintenance-configs/${configId}`,
    {
      method: "PATCH",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export type GenerateBillsResult = {
  items: Bill[];
  createdCount: number;
  alreadyExisting: number;
  skippedIneligible: number;
  failed: Array<{ unitId: string; unitNumber?: string; reason: string }>;
  skippedExisting: number;
};

export async function previewBills(
  accessToken: string,
  societyId: string,
  input: {
    configId: string;
    periodYear: number;
    periodMonth: number;
    discountAmount?: string;
  },
): Promise<GenerateBillsResult> {
  const response = await apiRequest<DataEnvelope<GenerateBillsResult>>(
    `/api/v1/societies/${societyId}/maintenance-bills/preview`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function generateBills(
  accessToken: string,
  societyId: string,
  input: {
    configId: string;
    periodYear: number;
    periodMonth: number;
    discountAmount?: string;
  },
): Promise<GenerateBillsResult> {
  const response = await apiRequest<DataEnvelope<GenerateBillsResult>>(
    `/api/v1/societies/${societyId}/maintenance-bills/generate`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function publishPeriod(
  accessToken: string,
  societyId: string,
  periodYear: number,
  periodMonth: number,
): Promise<{ publishedCount: number }> {
  const response = await apiRequest<DataEnvelope<{ publishedCount: number }>>(
    `/api/v1/societies/${societyId}/maintenance-bills/publish-period`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ periodYear, periodMonth }),
    },
  );
  return response.data;
}

export async function fetchBills(
  accessToken: string,
  societyId: string,
  options?: {
    page?: number;
    limit?: number;
    status?: string;
    periodYear?: number;
    periodMonth?: number;
  },
): Promise<PaginatedBills> {
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 50),
  });
  if (options?.status) params.set("status", options.status);
  if (options?.periodYear) params.set("periodYear", String(options.periodYear));
  if (options?.periodMonth)
    params.set("periodMonth", String(options.periodMonth));
  const response = await apiRequest<DataEnvelope<PaginatedBills>>(
    `/api/v1/societies/${societyId}/maintenance-bills?${params.toString()}`,
    { accessToken },
  );
  return response.data;
}

export async function fetchBill(
  accessToken: string,
  billId: string,
): Promise<Bill> {
  const response = await apiRequest<DataEnvelope<Bill>>(
    `/api/v1/maintenance-bills/${billId}`,
    { accessToken },
  );
  return response.data;
}

export async function publishBill(
  accessToken: string,
  billId: string,
): Promise<Bill> {
  const response = await apiRequest<DataEnvelope<Bill>>(
    `/api/v1/maintenance-bills/${billId}/publish`,
    { method: "POST", accessToken },
  );
  return response.data;
}

export async function fetchBillingDashboard(
  accessToken: string,
  societyId: string,
  options?: { periodYear?: number; periodMonth?: number },
): Promise<BillingDashboard> {
  const params = new URLSearchParams();
  if (options?.periodYear) params.set("periodYear", String(options.periodYear));
  if (options?.periodMonth)
    params.set("periodMonth", String(options.periodMonth));
  const query = params.toString();
  const response = await apiRequest<DataEnvelope<BillingDashboard>>(
    `/api/v1/societies/${societyId}/billing-dashboard${query ? `?${query}` : ""}`,
    { accessToken },
  );
  return response.data;
}

export async function recordPayment(
  accessToken: string,
  billId: string,
  input: {
    idempotencyKey: string;
    amount: string;
    method: Payment["method"];
    paidAt: string;
    referenceNumber?: string;
    notes?: string;
  },
): Promise<{ payment: Payment; bill: Bill }> {
  const response = await apiRequest<
    DataEnvelope<{ payment: Payment; bill: Bill }>
  >(`/api/v1/maintenance-bills/${billId}/payments`, {
    method: "POST",
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function downloadInvoicePdf(
  accessToken: string,
  billId: string,
): Promise<Blob> {
  const { apiUrl } = getPublicConfig();
  const url = new URL(
    `/api/v1/maintenance-bills/${billId}/pdf`,
    `${apiUrl}/`,
  );
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/pdf",
    },
  });
  if (!response.ok) {
    redirectIfSessionExpired(response.status);
    throw new ApiError(
      "Unable to download invoice PDF",
      response.status,
      "PDF_DOWNLOAD_FAILED",
    );
  }
  return response.blob();
}

export async function fetchBillPayments(
  accessToken: string,
  billId: string,
): Promise<Payment[]> {
  const response = await apiRequest<DataEnvelope<{ items: Payment[] }>>(
    `/api/v1/maintenance-bills/${billId}/payments`,
    { accessToken },
  );
  return response.data.items;
}

export async function reversePayment(
  accessToken: string,
  paymentId: string,
  reason: string,
): Promise<{ payment: Payment; bill: Bill }> {
  const response = await apiRequest<
    DataEnvelope<{ payment: Payment; bill: Bill }>
  >(`/api/v1/maintenance-payments/${paymentId}/reverse`, {
    method: "POST",
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  return response.data;
}
