"use client";

import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { checkboxClassName, filterControlClassName } from "@/components/ui/control";
import { ListPager } from "@/components/ui/list-pager";
import { formatStatus } from "@/components/ui/status-tone";
import { useDebouncedValue } from "@/components/ui/use-debounced-value";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";
import { fetchServices } from "../api";
import { telHref, whatsappHref } from "../links";
import { SERVICE_CATEGORIES, type ServiceCategory } from "../types";

const PAGE_SIZE = 20;

type ServicesListProps = {
  societyId: string;
  canManage: boolean;
};

export function ServicesList({ societyId, canManage }: ServicesListProps) {
  const { t } = useI18n();
  const [category, setCategory] = useState<ServiceCategory | "">("");
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const search = debouncedQuery.length > 0 ? debouncedQuery : undefined;

  const listQuery = useQuery({
    queryKey: [
      "services",
      societyId,
      category || "all",
      canManage && showInactive ? "inactive" : "active",
      search ?? "",
      page,
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchServices(token, societyId, {
        category: category || undefined,
        active: canManage ? (showInactive ? undefined : true) : true,
        q: search,
        page,
        limit: PAGE_SIZE,
      });
    },
  });

  const items = listQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("work.servicesTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("work.servicesHelp")}</p>
        </div>
        {canManage ? (
          <Link
            href={`/societies/${societyId}/services/new`}
            className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-[var(--theme-primary-hover)]"
          >
            Add provider
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Search by name"
          aria-label="Search providers"
          className={`${filterControlClassName} min-w-[12rem] flex-1`}
        />
        <select
          aria-label="Category filter"
          value={category}
          onChange={(event) => {
            setCategory(event.target.value as ServiceCategory | "");
            setPage(1);
          }}
          className={filterControlClassName}
        >
          <option value="">{t("work.allCategories")}</option>
          {SERVICE_CATEGORIES.map((value) => (
            <option key={value} value={value}>
              {formatStatus(value)}
            </option>
          ))}
        </select>
        {canManage ? (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className={checkboxClassName}
              checked={showInactive}
              onChange={(event) => {
                setShowInactive(event.target.checked);
                setPage(1);
              }}
            />
            Include inactive
          </label>
        ) : null}
      </div>

      {listQuery.isLoading ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("work.loading")}
        </p>
      ) : null}
      {listQuery.isError ? (
        <p
          role="alert"
          className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {listQuery.error instanceof ApiError
            ? listQuery.error.message
            : t("work.loadFailed")}
        </p>
      ) : null}
      {!listQuery.isLoading && !listQuery.isError && items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
          No service providers match these filters.
        </p>
      ) : null}

      <ul className="space-y-2">
        {items.map((provider) => {
          const whatsapp = provider.whatsappNumber
            ? whatsappHref(provider.whatsappNumber)
            : null;
          return (
            <li key={provider.id}>
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/societies/${societyId}/services/${provider.id}`}
                      className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      {provider.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground capitalize">
                      {formatStatus(provider.category)}
                      {!provider.isActive ? " · Inactive" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <a
                      href={telHref(provider.phone)}
                      className="rounded-lg border border-border px-2 py-1 text-foreground hover:bg-muted/60"
                    >
                      Call
                    </a>
                    {whatsapp ? (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border px-2 py-1 text-foreground hover:bg-muted/60"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
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
