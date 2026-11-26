import { apiRequest } from "@/services/api-client";

export type PlatformMonthPoint = {
  month: string;
  societies: number;
  profiles: number;
  buildings: number;
  activity: number;
};

export type PlatformStats = {
  societies: number;
  buildings: number;
  profiles: number;
  units: number;
  memberships: number;
  noticesPublished: number;
  visitorsHandled: number;
  paymentsRecorded: number;
  activityThisMonth: number;
  monthly: PlatformMonthPoint[];
};

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const response = await apiRequest<{ data: PlatformStats }>("/api/v1/platform-stats", {
    method: "GET",
    cache: "no-store",
  });
  return response.data;
}
