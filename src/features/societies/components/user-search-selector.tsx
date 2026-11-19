"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { controlClassName } from "@/components/ui/control";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n/provider";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { searchUsers } from "../api";
import type { UserSearchItem } from "../types";

type UserSearchSelectorProps = {
  selected: UserSearchItem | null;
  onSelect: (user: UserSearchItem | null) => void;
  error?: string[];
  label?: string;
  inputId?: string;
  /**
   * When set, society admins search that society. An account with no
   * membership is returned only when the query is its full email address.
   * Omit for platform-owner society creation.
   */
  societyId?: string;
  /** Parent pages pass true only for a platform owner or an active society admin. */
  canSearch: boolean;
};

export function UserSearchSelector({
  selected,
  onSelect,
  error,
  label = "Initial society admin",
  inputId = "admin-search",
  societyId,
  canSearch,
}: UserSearchSelectorProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const search = useQuery({
    queryKey: ["user-search", societyId ?? "platform", debounced],
    enabled: canSearch && debounced.length >= 2 && !selected,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return searchUsers(token, debounced, 10, societyId);
    },
  });

  if (!canSearch) {
    return null;
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>

      {selected ? (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-input bg-muted/50 px-3 py-2">
          <div>
            <p className="text-sm font-medium text-foreground">
              {selected.displayName}
            </p>
            <p className="text-xs text-muted-foreground">
              {selected.email ?? "No email on profile"}
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => {
              onSelect(null);
              setQuery("");
            }}
          >
            {t("search.change")}
          </button>
        </div>
      ) : (
        <>
          <input
            id={inputId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              societyId
                ? "Name in this society, or a full email address"
                : "Search by name or email"
            }
            aria-invalid={Boolean(error?.length)}
            className={controlClassName}
          />
          {debounced.length > 0 && debounced.length < 2 ? (
            <p className="text-xs text-muted-foreground">{t("search.minChars")}</p>
          ) : null}
          {search.isFetching ? (
            <Spinner label={t("search.searching")} />
          ) : null}
          {search.isError ? (
            <p role="alert" className="text-sm text-destructive">
              {search.error instanceof ApiError
                ? search.error.message
                : t("search.failed")}
            </p>
          ) : null}
          {search.isSuccess && search.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {societyId
                ? debounced.includes("@")
                  ? "No account with that email is available to invite. Search does not create an account or a membership."
                  : "No matching member in this society."
                : "No matching users found."}
            </p>
          ) : null}
          {search.isSuccess && search.data.length > 0 ? (
            <ul className="overflow-hidden rounded-lg border border-border bg-card">
              {search.data.map((user) => (
                <li key={user.id} className="border-b border-border last:border-b-0">
                  <button
                    type="button"
                    className="flex w-full flex-col items-start px-3 py-2 text-left hover:bg-muted/60"
                    onClick={() => onSelect(user)}
                  >
                    <span className="text-sm font-medium text-foreground">
                      {user.displayName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email ?? "No email on profile"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}

      {error?.length ? (
        <p className="text-sm text-destructive">{error[0]}</p>
      ) : null}
    </div>
  );
}
