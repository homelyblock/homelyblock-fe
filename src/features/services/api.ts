import { apiRequest } from "@/services/api-client";
import type {
  PaginatedServices,
  ServiceCategory,
  ServiceProvider,
} from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchServices(
  accessToken: string,
  societyId: string,
  options?: {
    page?: number;
    limit?: number;
    category?: ServiceCategory;
    active?: boolean;
    q?: string;
  },
): Promise<PaginatedServices> {
  const params = new URLSearchParams({
    page: String(options?.page ?? 1),
    limit: String(options?.limit ?? 50),
  });
  if (options?.category) params.set("category", options.category);
  if (options?.active !== undefined) params.set("active", String(options.active));
  if (options?.q) params.set("q", options.q);
  const response = await apiRequest<DataEnvelope<PaginatedServices>>(
    `/api/v1/societies/${societyId}/services?${params.toString()}`,
    { accessToken },
  );
  return response.data;
}

export async function createService(
  accessToken: string,
  societyId: string,
  input: {
    name: string;
    category: ServiceCategory;
    description?: string;
    contactPerson?: string;
    phone: string;
    whatsappNumber?: string;
    address?: string;
  },
): Promise<ServiceProvider> {
  const response = await apiRequest<DataEnvelope<ServiceProvider>>(
    `/api/v1/societies/${societyId}/services`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function fetchService(
  accessToken: string,
  serviceId: string,
): Promise<ServiceProvider> {
  const response = await apiRequest<DataEnvelope<ServiceProvider>>(
    `/api/v1/services/${serviceId}`,
    { accessToken },
  );
  return response.data;
}

export async function updateService(
  accessToken: string,
  serviceId: string,
  input: Partial<{
    name: string;
    category: ServiceCategory;
    description: string | null;
    contactPerson: string | null;
    phone: string;
    whatsappNumber: string | null;
    address: string | null;
  }>,
): Promise<ServiceProvider> {
  const response = await apiRequest<DataEnvelope<ServiceProvider>>(
    `/api/v1/services/${serviceId}`,
    {
      method: "PATCH",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function deactivateService(
  accessToken: string,
  serviceId: string,
): Promise<ServiceProvider> {
  const response = await apiRequest<DataEnvelope<ServiceProvider>>(
    `/api/v1/services/${serviceId}/deactivate`,
    { method: "PATCH", accessToken },
  );
  return response.data;
}

export async function activateService(
  accessToken: string,
  serviceId: string,
): Promise<ServiceProvider> {
  const response = await apiRequest<DataEnvelope<ServiceProvider>>(
    `/api/v1/services/${serviceId}/activate`,
    { method: "PATCH", accessToken },
  );
  return response.data;
}
