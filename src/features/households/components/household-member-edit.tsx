"use client";

import { useQuery } from "@tanstack/react-query";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { fetchOwnHousehold } from "../api";
import { HouseholdMemberForm } from "./household-member-form";

type HouseholdMemberEditProps = {
  societyId: string;
  memberId: string;
};

export function HouseholdMemberEdit({
  societyId,
  memberId,
}: HouseholdMemberEditProps) {
  const query = useQuery({
    queryKey: ["household", societyId, "edit", memberId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchOwnHousehold(token, societyId, false);
    },
  });

  if (query.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading member…
      </p>
    );
  }

  if (query.isError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {query.error instanceof ApiError
          ? query.error.message
          : "Unable to load household member."}
      </p>
    );
  }

  const member = query.data?.items.find((item) => item.id === memberId);
  if (!member) {
    return (
      <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
        Household member not found.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Edit household member
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Update details or deactivate this household member.
        </p>
      </div>
      <HouseholdMemberForm societyId={societyId} member={member} />
    </div>
  );
}
