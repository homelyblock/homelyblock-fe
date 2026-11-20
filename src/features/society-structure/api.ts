import { apiRequest } from "@/services/api-client";
import type {
  Building,
  CreateBuildingInput,
  CreateMembershipInput,
  CreateUnitInput,
  ListQuery,
  Membership,
  Page,
  Unit,
  UpdateBuildingInput,
  UpdateMembershipInput,
  UpdateUnitInput,
} from "./types";

type DataEnvelope<T> = { data: T };

function queryString(query?: ListQuery): string {
  const params = new URLSearchParams();
  if (query?.page) params.set("page", String(query.page));
  if (query?.limit) params.set("limit", String(query.limit));
  if (query?.q) params.set("q", query.q);
  if (query?.buildingId) params.set("buildingId", query.buildingId);
  if (query?.status) params.set("status", query.status);
  if (query?.role) params.set("role", query.role);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export async function fetchBuildings(
  accessToken: string,
  societyId: string,
  query?: ListQuery,
): Promise<Page<Building>> {
  const response = await apiRequest<DataEnvelope<Page<Building>>>(
    `/api/v1/societies/${societyId}/buildings${queryString(query)}`,
    { accessToken },
  );
  return response.data;
}

export async function createBuilding(
  accessToken: string,
  societyId: string,
  input: CreateBuildingInput,
): Promise<Building> {
  const response = await apiRequest<DataEnvelope<Building>>(
    `/api/v1/societies/${societyId}/buildings`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateBuilding(
  accessToken: string,
  societyId: string,
  buildingId: string,
  input: UpdateBuildingInput,
): Promise<Building> {
  const response = await apiRequest<DataEnvelope<Building>>(
    `/api/v1/societies/${societyId}/buildings/${buildingId}`,
    {
      method: "PATCH",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function fetchUnits(
  accessToken: string,
  societyId: string,
  query?: ListQuery,
): Promise<Page<Unit>> {
  const response = await apiRequest<DataEnvelope<Page<Unit>>>(
    `/api/v1/societies/${societyId}/units${queryString(query)}`,
    { accessToken },
  );
  return response.data;
}

export async function createUnit(
  accessToken: string,
  societyId: string,
  input: CreateUnitInput,
): Promise<Unit> {
  const response = await apiRequest<DataEnvelope<Unit>>(
    `/api/v1/societies/${societyId}/units`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateUnit(
  accessToken: string,
  societyId: string,
  unitId: string,
  input: UpdateUnitInput,
): Promise<Unit> {
  const response = await apiRequest<DataEnvelope<Unit>>(
    `/api/v1/societies/${societyId}/units/${unitId}`,
    {
      method: "PATCH",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function fetchMembers(
  accessToken: string,
  societyId: string,
  query?: ListQuery,
): Promise<Page<Membership>> {
  const response = await apiRequest<DataEnvelope<Page<Membership>>>(
    `/api/v1/societies/${societyId}/members${queryString(query)}`,
    { accessToken },
  );
  return response.data;
}

export async function createMembership(
  accessToken: string,
  societyId: string,
  input: CreateMembershipInput,
): Promise<Membership> {
  const response = await apiRequest<DataEnvelope<Membership>>(
    `/api/v1/societies/${societyId}/members`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateMembership(
  accessToken: string,
  membershipId: string,
  input: UpdateMembershipInput,
): Promise<Membership> {
  const response = await apiRequest<DataEnvelope<Membership>>(
    `/api/v1/memberships/${membershipId}`,
    {
      method: "PATCH",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}
