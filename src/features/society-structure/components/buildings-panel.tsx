"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { preservedSubmit } from "@/lib/form-submit";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ListPager } from "@/components/ui/list-pager";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";
import { createBuilding, fetchBuildings, updateBuilding } from "../api";
import { createBuildingSchema } from "../schemas";
import type { Building } from "../types";

type BuildingsPanelProps = {
  societyId: string;
  canManage: boolean;
};

export function BuildingsPanel({ societyId, canManage }: BuildingsPanelProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<Building | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const query = useQuery({
    queryKey: ["buildings", societyId, page, submittedSearch],
    enabled: canManage,
    placeholderData: (previous) => previous,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBuildings(token, societyId, {
        page,
        limit: 25,
        ...(submittedSearch ? { q: submittedSearch } : {}),
      });
    },
  });

  function onSubmit(formData: FormData, form: HTMLFormElement) {
    const parsed = createBuildingSchema.safeParse({
      name: formData.get("name"),
      code: formData.get("code"),
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const next: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(flattened)) {
        if (value && value.length > 0) {
          next[key] = value;
        }
      }
      setFieldErrors(next);
      setStatus("error");
      setMessage("Check the highlighted fields.");
      return;
    }

    setFieldErrors({});
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }

        if (editing) {
          await updateBuilding(token, societyId, editing.id, parsed.data);
          setMessage("Building updated.");
        } else {
          await createBuilding(token, societyId, parsed.data);
          setMessage("Building created.");
        }

        setStatus("success");
        setEditing(null);
        form.reset();
        await queryClient.invalidateQueries({
          queryKey: ["buildings", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to save building.",
        );
      }
    });
  }

  if (!canManage) {
    return null;
  }

  if (query.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("forms.loadingBuildings")}
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
          : t("forms.buildingsFailed")}
      </p>
    );
  }

  const buildings = query.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("forms.buildingsTitle")}</h2>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSubmittedSearch(search.trim());
          }}
        >
          <label className="sr-only" htmlFor="building-search">
            {t("directory.searchBuildings")}
          </label>
          <input
            id="building-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("directory.searchBuildings")}
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
          />
          <Button type="submit" variant="outline">
            {t("directory.search")}
          </Button>
        </form>
        {buildings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("forms.noBuildings")}</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {buildings.map((building) => (
              <li
                key={building.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {building.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{t("forms.codeValue", { code: building.code })}</p>
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(building);
                      setStatus("idle");
                      setMessage(undefined);
                    }}
                  >
                    {t("common.edit")}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <ListPager
          page={page}
          pageSize={query.data?.limit ?? 25}
          total={query.data?.total ?? 0}
          disabled={query.isFetching}
          onPage={setPage}
        />
      </div>

      {canManage ? (
        <form noValidate onSubmit={preservedSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-card px-5 py-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {editing ? t("forms.editBuilding") : t("forms.addBuilding")}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("forms.codeUnique")}
            </p>
          </div>
          <Field
            id="building-name"
            name="name"
            label={t("forms.name")}
            defaultValue={editing?.name ?? ""}
            key={`name-${editing?.id ?? "new"}`}
            error={fieldErrors.name}
          />
          <Field
            id="building-code"
            name="code"
            label={t("forms.code")}
            defaultValue={editing?.code ?? ""}
            key={`code-${editing?.id ?? "new"}`}
            error={fieldErrors.code}
          />
          <AuthStatus status={status} message={message} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? t("common.saving") : editing ? t("forms.updateBuilding") : t("forms.createBuilding")}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setEditing(null)}
              >
                {t("common.cancel")}
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
