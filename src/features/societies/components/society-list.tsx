"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingSkeleton } from "@/components/layout/status-views";
import { ApiError } from "@/services/api-client";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { Metric } from "@/features/dashboard/components/metric";
import { fetchSocieties } from "../api";

const PAGE_SIZE = 20;

export function SocietyList({ isPlatformOwner }: { isPlatformOwner: boolean }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["societies", { page, limit: PAGE_SIZE }],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchSocieties(token, page, PAGE_SIZE);
    },
  });

  if (query.isLoading) {
    return <LoadingSkeleton label="Loading societies" />;
  }

  if (query.isError) {
    const message =
      query.error instanceof ApiError
        ? query.error.message
        : "Unable to load societies.";
    return <Alert>{message}</Alert>;
  }

  const data = query.data;
  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        title={isPlatformOwner ? "No societies yet" : "No society assigned"}
        description={
          isPlatformOwner
            ? "Create a society and assign its first administrator to begin."
            : "An administrator needs to add you to a society before records appear here."
        }
      />
    );
  }

  const pageCount = Math.max(1, Math.ceil(data.total / data.limit));

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Societies" value={data.total} />
        <Metric label="Active" value={data.activeCount} />
        <Metric label="Archived" value={data.archivedCount} />
      </div>
      <ul className="space-y-3">
        {data.items.map((society) => (
          <li key={society.id}>
            <Link
              href={`/societies/${society.id}`}
              className="block rounded-lg border border-border bg-card px-5 py-4 transition hover:border-teal/40 hover:bg-muted/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{society.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[society.city, society.state].filter(Boolean).join(", ") || "Location not set"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge value={society.status} />
                  {society.membershipRole ? (
                    <StatusBadge value={society.membershipRole} />
                  ) : null}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1 || query.isFetching}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page >= pageCount || query.isFetching}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
