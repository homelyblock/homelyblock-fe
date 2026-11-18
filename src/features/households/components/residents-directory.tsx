"use client";

import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { controlClassName } from "@/components/ui/control";
import { ListPager } from "@/components/ui/list-pager";
import { useDebouncedValue } from "@/components/ui/use-debounced-value";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { fetchSocietyHouseholds } from "../api";

const PAGE_SIZE = 20;

type ResidentsDirectoryProps = {
  societyId: string;
};

export function ResidentsDirectory({ societyId }: ResidentsDirectoryProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const search = debouncedQuery.length > 0 ? debouncedQuery : undefined;

  const listQuery = useQuery({
    queryKey: ["society-households", societyId, search ?? "", page],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchSocietyHouseholds(token, societyId, {
        q: search,
        page,
        limit: PAGE_SIZE,
      });
    },
  });

  const items = listQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Resident directory
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Society-scoped occupancy and household members. Not a platform-wide
          user directory.
        </p>
      </div>

      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
        placeholder="Search by name or email"
        aria-label="Search residents"
        className={controlClassName}
      />

      {listQuery.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          Loading residents…
        </p>
      ) : null}
      {listQuery.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {listQuery.error instanceof ApiError
            ? listQuery.error.message
            : "Unable to load residents."}
        </p>
      ) : null}
      {!listQuery.isLoading && !listQuery.isError && items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
          {search ? "No residents match this search." : "No residents yet."}
        </p>
      ) : null}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.membershipId}>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.displayName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.role.replaceAll("_", " ")} · {item.status}
                    {item.buildingName && item.primaryUnitNumber
                      ? ` · ${item.buildingName} ${item.primaryUnitNumber}`
                      : " · No primary unit"}
                    {` · ${item.activeHouseholdCount} household`}
                  </p>
                </div>
                {item.primaryUnitId ? (
                  <Link
                    href={`/societies/${societyId}/residents/units/${item.primaryUnitId}`}
                    className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Unit occupancy
                  </Link>
                ) : null}
              </div>
              {item.householdMembers.length > 0 ? (
                <ul className="mt-2 space-y-1 border-t border-border pt-2 text-xs text-muted-foreground">
                  {item.householdMembers.map((member) => (
                    <li key={member.id}>
                      {member.name} ·{" "}
                      {member.relationship.replaceAll("_", " ")}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      <ListPager
        page={listQuery.data?.page ?? page}
        pageSize={listQuery.data?.limit ?? PAGE_SIZE}
        total={listQuery.data?.total ?? 0}
        disabled={listQuery.isFetching}
        onPage={setPage}
      />
    </div>
  );
}
