import { apiRequest } from "@/services/api-client";
import type {
  HouseholdMember,
  HouseholdMemberInput,
  OwnHousehold,
  SocietyHouseholdsPage,
  UnitHousehold,
} from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchOwnHousehold(
  accessToken: string,
  societyId: string,
  active = true,
): Promise<OwnHousehold> {
  const params = new URLSearchParams({
    societyId,
    active: String(active),
  });
  const response = await apiRequest<DataEnvelope<OwnHousehold>>(
    `/api/v1/me/household?${params}`,
    { accessToken },
  );
  return response.data;
}

export async function createOwnHouseholdMember(
  accessToken: string,
  societyId: string,
  input: HouseholdMemberInput,
): Promise<HouseholdMember> {
  const response = await apiRequest<DataEnvelope<HouseholdMember>>(
    "/api/v1/me/household",
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ societyId, ...input }),
    },
  );
  return response.data;
}

export async function createAdminHouseholdMember(
  accessToken: string,
  societyId: string,
  input: HouseholdMemberInput & { membershipId: string },
): Promise<HouseholdMember> {
  const response = await apiRequest<DataEnvelope<HouseholdMember>>(
    `/api/v1/societies/${societyId}/household-members`,
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function updateHouseholdMember(
  accessToken: string,
  memberId: string,
  input: {
    name?: string;
    relationship?: HouseholdMemberInput["relationship"];
    phone?: string | null;
    email?: string | null;
  },
): Promise<HouseholdMember> {
  const response = await apiRequest<DataEnvelope<HouseholdMember>>(
    `/api/v1/household-members/${memberId}`,
    {
      method: "PATCH",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  return response.data;
}

export async function deactivateHouseholdMember(
  accessToken: string,
  memberId: string,
): Promise<HouseholdMember> {
  const response = await apiRequest<DataEnvelope<HouseholdMember>>(
    `/api/v1/household-members/${memberId}/deactivate`,
    {
      method: "PATCH",
      accessToken,
    },
  );
  return response.data;
}

export async function fetchSocietyHouseholds(
  accessToken: string,
  societyId: string,
  options?: { q?: string; page?: number; limit?: number },
): Promise<SocietyHouseholdsPage> {
  const params = new URLSearchParams();
  if (options?.q) params.set("q", options.q);
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));
  const qs = params.toString();
  const response = await apiRequest<DataEnvelope<SocietyHouseholdsPage>>(
    `/api/v1/societies/${societyId}/households${qs ? `?${qs}` : ""}`,
    { accessToken },
  );
  return response.data;
}

export async function fetchUnitHousehold(
  accessToken: string,
  societyId: string,
  unitId: string,
): Promise<UnitHousehold> {
  const response = await apiRequest<DataEnvelope<UnitHousehold>>(
    `/api/v1/societies/${societyId}/households/${unitId}`,
    { accessToken },
  );
  return response.data;
}
