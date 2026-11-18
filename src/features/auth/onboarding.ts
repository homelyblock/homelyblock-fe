import { apiRequest } from "@/services/api-client";
import type { MeResponse } from "@/features/societies/types";

export async function submitOnboarding(accessToken: string): Promise<MeResponse> {
  const response = await apiRequest<{ data: MeResponse }>(
    "/api/v1/me/onboarding",
    {
      method: "POST",
      accessToken,
      headers: { "Content-Type": "application/json" },
      body: "{}",
    },
  );
  return response.data;
}
