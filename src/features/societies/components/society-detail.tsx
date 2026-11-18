"use client";

import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/services/api-client";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { fetchSociety } from "../api";
import { EditSocietyForm } from "./edit-society-form";

type SocietyDetailViewProps = {
  societyId: string;
  canEdit: boolean;
};

export function SocietyDetailView({
  societyId,
  canEdit,
}: SocietyDetailViewProps) {
  const query = useQuery({
    queryKey: ["society", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchSociety(token, societyId);
    },
  });

  if (query.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading society…
      </p>
    );
  }

  if (query.isError) {
    const message =
      query.error instanceof ApiError
        ? query.error.message
        : "Unable to load this society.";
    return (
      <p role="alert" className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {message}
      </p>
    );
  }

  const society = query.data;
  if (!society) {
    return null;
  }

  const showEdit =
    canEdit &&
    ("addressLine1" in society || society.membershipRole === "SOCIETY_ADMIN");

  return (
    <div className="space-y-6">
      <div className="space-y-6 rounded-lg border border-border bg-card px-6 py-6">
        <div>
          <p className="text-sm text-muted-foreground">{society.status}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {society.name}
          </h1>
          {society.membershipRole ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Your membership: {society.membershipRole}
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Platform view</p>
          )}
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              City
            </dt>
            <dd className="mt-1 text-sm text-foreground">{society.city ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              State
            </dt>
            <dd className="mt-1 text-sm text-foreground">{society.state ?? "—"}</dd>
          </div>
          {"addressLine1" in society ? (
            <>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Address
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {[society.addressLine1, society.addressLine2]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Postal code
                </dt>
                <dd className="mt-1 text-sm text-foreground">
                  {society.postalCode ?? "—"}
                </dd>
              </div>
            </>
          ) : null}
        </dl>
      </div>

      {showEdit && "addressLine1" in society ? (
        <div className="rounded-lg border border-border bg-card px-6 py-6">
          <EditSocietyForm society={society} />
        </div>
      ) : null}
    </div>
  );
}
