import { apiRequest } from "@/services/api-client";
import type {
  Building,
  CreateBuildingInput,
  CreateMembershipInput,
  CreateUnitInput,
  Membership,
  Unit,
  UpdateBuildingInput,
  UpdateMembershipInput,
  UpdateUnitInput,
} from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchBuildings(
  accessToken: string,
  societyId: string,
): Promise<Building[]> {
  const response = await apiRequest<DataEnvelope<{ items: Building[] }>>(
    `/api/v1/societies/${societyId}/buildings`,
    { accessToken },
  );
  return response.data.items;
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
  buildingId?: string,
): Promise<Unit[]> {
  const params = new URLSearchParams();
  if (buildingId) {
    params.set("buildingId", buildingId);
  }
  const query = params.toString();
  const response = await apiRequest<DataEnvelope<{ items: Unit[] }>>(
    `/api/v1/societies/${societyId}/units${query ? `?${query}` : ""}`,
    { accessToken },
  );
  return response.data.items;
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
): Promise<Membership[]> {
  const response = await apiRequest<DataEnvelope<{ items: Membership[] }>>(
    `/api/v1/societies/${societyId}/members`,
    { accessToken },
  );
  return response.data.items;
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
