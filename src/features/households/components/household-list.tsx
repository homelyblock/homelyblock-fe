"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";
import { formatIndianPhone } from "@/lib/indian-phone";
import { fetchOwnHousehold } from "../api";

type HouseholdListProps = {
  societyId: string;
};

export function HouseholdList({ societyId }: HouseholdListProps) {
  const { t } = useI18n();
  const query = useQuery({
    queryKey: ["household", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchOwnHousehold(token, societyId, false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("work.myHousehold")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Family and other occupants for your unit. Household members do not
            get login accounts.
          </p>
        </div>
        <Link
          href={`/societies/${societyId}/household/new`}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
        >
          Add member
        </Link>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("work.loading")}
        </p>
      ) : null}
      {query.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {query.error instanceof ApiError
            ? query.error.message
            : t("work.loadFailed")}
        </p>
      ) : null}
      {!query.isLoading &&
      !query.isError &&
      (query.data?.items.length ?? 0) === 0 ? (
        <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
          No household members yet. Add family members who share your unit.
        </p>
      ) : null}

      <ul className="space-y-2">
        {query.data?.items.map((member) => (
          <li key={member.id}>
            <div className="rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {member.name}
                    {!member.isActive ? (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        Inactive
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {member.relationship.replaceAll("_", " ")}
                    {member.phone ? ` · ${formatIndianPhone(member.phone)}` : ""}
                  </p>
                </div>
                {member.isActive ? (
                  <Link
                    href={`/societies/${societyId}/household/${member.id}/edit`}
                    className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
