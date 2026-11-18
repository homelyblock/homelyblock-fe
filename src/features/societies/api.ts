import { cache } from "react";
import { apiRequest } from "@/services/api-client";
import type {
  CreateSocietyInput,
  CreateSocietyResult,
  MeResponse,
  PaginatedSocieties,
  SocietyDetail,
  UpdateSocietyInput,
  UserSearchItem,
} from "./types";

type DataEnvelope<T> = { data: T };

export const fetchMe = cache(async function fetchMe(
  accessToken: string,
): Promise<MeResponse> {
  const response = await apiRequest<DataEnvelope<MeResponse>>("/api/v1/me", {
    accessToken,
  });
  return response.data;
});

export async function fetchSocieties(
  accessToken: string,
  page = 1,
  limit = 20,
): Promise<PaginatedSocieties> {
  const response = await apiRequest<DataEnvelope<PaginatedSocieties>>(
    `/api/v1/societies?page=${page}&limit=${limit}`,
    { accessToken },
  );
  return response.data;
}

export const fetchSociety = cache(async function fetchSociety(
  accessToken: string,
  societyId: string,
): Promise<SocietyDetail> {
  const response = await apiRequest<DataEnvelope<SocietyDetail>>(
    `/api/v1/societies/${societyId}`,
    { accessToken },
  );
  return response.data;
});

export async function createSociety(
  accessToken: string,
  input: CreateSocietyInput,
): Promise<CreateSocietyResult> {
  const response = await apiRequest<DataEnvelope<CreateSocietyResult>>(
    "/api/v1/societies",
    {
      method: "POST",
      accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateSociety(
  accessToken: string,
  societyId: string,
  input: UpdateSocietyInput,
): Promise<SocietyDetail> {
  const response = await apiRequest<DataEnvelope<SocietyDetail>>(
    `/api/v1/societies/${societyId}`,
    {
      method: "PATCH",
      accessToken,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function searchUsers(
  accessToken: string,
  q: string,
  limit = 10,
  societyId?: string,
): Promise<UserSearchItem[]> {
  const params = new URLSearchParams({
    q,
    limit: String(limit),
  });
  if (societyId) {
    params.set("societyId", societyId);
  }
  const response = await apiRequest<DataEnvelope<{ items: UserSearchItem[] }>>(
    `/api/v1/users/search?${params.toString()}`,
    { accessToken },
  );
  return response.data.items;
}
