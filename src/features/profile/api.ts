import { apiRequest } from "@/services/api-client";
import type { Profile, UpdateProfileInput } from "./types";

type DataEnvelope<T> = { data: T };

export async function fetchProfile(accessToken: string): Promise<Profile> {
  const response = await apiRequest<DataEnvelope<Profile>>("/api/v1/me", {
    accessToken,
  });
  return response.data;
}

export async function updateProfile(
  accessToken: string,
  input: UpdateProfileInput,
): Promise<Profile> {
  const response = await apiRequest<DataEnvelope<Profile>>("/api/v1/me", {
    method: "PATCH",
    accessToken,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return response.data;
}
