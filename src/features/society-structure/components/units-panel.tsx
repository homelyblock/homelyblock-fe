"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { preservedSubmit } from "@/lib/form-submit";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { OptionSearch } from "@/components/ui/option-search";
import { ListPager } from "@/components/ui/list-pager";
import { controlClassName, filterControlClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";
import {
  createUnit,
  fetchBuildings,
  fetchUnits,
  updateUnit,
} from "../api";
import { createUnitSchema } from "../schemas";
import type { Unit } from "../types";

type UnitsPanelProps = {
  societyId: string;
  canManage: boolean;
};

export function UnitsPanel({ societyId, canManage }: UnitsPanelProps) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [filterBuildingId, setFilterBuildingId] = useState("");
  const [editing, setEditing] = useState<Unit | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [buildingSearch, setBuildingSearch] = useState("");

  const buildingsQuery = useQuery({
    queryKey: ["buildings", societyId, "options", buildingSearch],
    enabled: canManage,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBuildings(token, societyId, {
        limit: 100,
        ...(buildingSearch.trim() ? { q: buildingSearch.trim() } : {}),
      });
    },
  });

  const unitsQuery = useQuery({
    queryKey: ["units", societyId, filterBuildingId || "all", page, submittedSearch],
    enabled: canManage,
    placeholderData: (previous) => previous,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchUnits(token, societyId, {
        page,
        limit: 25,
        ...(filterBuildingId ? { buildingId: filterBuildingId } : {}),
        ...(submittedSearch ? { q: submittedSearch } : {}),
      });
    },
  });

  const buildingNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const building of buildingsQuery.data?.items ?? []) {
      map.set(building.id, `${building.name} (${building.code})`);
    }
    return map;
  }, [buildingsQuery.data]);

  function onSubmit(formData: FormData, form: HTMLFormElement) {
    const parsed = createUnitSchema.safeParse({
      buildingId: editing?.buildingId ?? formData.get("buildingId"),
      unitNumber: formData.get("unitNumber"),
      status: formData.get("status") || "ACTIVE",
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
          await updateUnit(token, societyId, editing.id, {
            unitNumber: parsed.data.unitNumber,
            status: parsed.data.status,
          });
          setMessage("Unit updated.");
        } else {
          await createUnit(token, societyId, parsed.data);
          setMessage("Unit created.");
        }

        setStatus("success");
        setEditing(null);
        form.reset();
        await queryClient.invalidateQueries({ queryKey: ["units", societyId] });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError ? error.message : "Unable to save unit.",
        );
      }
    });
  }

  if (!canManage) {
    return null;
  }

  if (buildingsQuery.isLoading || unitsQuery.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        {t("directory.loadingUnits")}
      </p>
    );
  }

  if (buildingsQuery.isError || unitsQuery.isError) {
    const error = buildingsQuery.error ?? unitsQuery.error;
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {error instanceof ApiError ? error.message : t("directory.unitsFailed")}
      </p>
    );
  }

  const buildings = buildingsQuery.data?.items ?? [];
  const units = unitsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{t("forms.unitsTitle")}</h2>
          <div className="space-y-1.5">
            <label
              htmlFor="unit-filter-building"
              className="block text-sm font-medium text-foreground"
            >
              {t("nav.buildings")}
            </label>
            <OptionSearch
              id="unit-building-search"
              label={t("work.findBuilding")}
              value={buildingSearch}
              onChange={setBuildingSearch}
              total={buildingsQuery.data?.total}
              shown={buildings.length}
            />
            <select
              id="unit-filter-building"
              value={filterBuildingId}
              onChange={(event) => {
                setFilterBuildingId(event.target.value);
                setPage(1);
              }}
              className={filterControlClassName}
            >
              <option value="">{t("directory.allBuildings")}</option>
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} ({building.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {(buildingsQuery.data?.total ?? buildings.length) === 0 &&
        !buildingSearch.trim() ? (
          <p className="text-sm text-muted-foreground">{t("work.needBuilding")}</p>
        ) : units.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("directory.noUnits")}</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
            {units.map((unit) => (
              <li
                key={unit.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Unit {unit.unitNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {buildingNameById.get(unit.buildingId) ?? "Building"} ·{" "}
                    {unit.status}
                  </p>
                </div>
                {canManage ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing(unit);
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
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSubmittedSearch(search.trim());
          }}
        >
          <label className="sr-only" htmlFor="unit-search">
            {t("directory.searchUnits")}
          </label>
          <input
            id="unit-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("directory.searchUnits")}
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-card px-3 text-sm"
          />
          <Button type="submit" variant="outline">
            {t("directory.search")}
          </Button>
        </form>
        <ListPager
          page={page}
          pageSize={unitsQuery.data?.limit ?? 25}
          total={unitsQuery.data?.total ?? 0}
          disabled={unitsQuery.isFetching}
          onPage={setPage}
        />
      </div>

      {canManage && buildings.length > 0 ? (
        <form
          noValidate onSubmit={preservedSubmit(onSubmit)}
          className="space-y-4 rounded-lg border border-border bg-card px-5 py-5"
        >
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {editing ? "Edit unit" : "Add unit"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Unit numbers must be unique within a building.
            </p>
          </div>

          {!editing ? (
            <div className="space-y-1.5">
              <label
                htmlFor="unit-building"
                className="block text-sm font-medium text-foreground"
              >
                Building
              </label>
              <select
                id="unit-building"
                name="buildingId"
                defaultValue=""
                className={controlClassName}
                aria-invalid={Boolean(fieldErrors.buildingId?.length)}
              >
                <option value="" disabled>
                  Select a building
                </option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name} ({building.code})
                  </option>
                ))}
              </select>
              {fieldErrors.buildingId?.length ? (
                <p className="text-sm text-destructive">{fieldErrors.buildingId[0]}</p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Building: {buildingNameById.get(editing.buildingId) ?? "—"}
            </p>
          )}

          <Field
            id="unit-number"
            name="unitNumber"
            label="Unit number"
            defaultValue={editing?.unitNumber ?? ""}
            key={`unit-${editing?.id ?? "new"}`}
            error={fieldErrors.unitNumber}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="unit-status"
              className="block text-sm font-medium text-foreground"
            >
              Status
            </label>
            <select
              id="unit-status"
              name="status"
              defaultValue={editing?.status ?? "ACTIVE"}
              key={`status-${editing?.id ?? "new"}`}
              className={controlClassName}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <AuthStatus status={status} message={message} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing ? "Update unit" : "Create unit"}
            </Button>
            {editing ? (
              <Button
                type="button"
                variant="ghost"
                disabled={pending}
                onClick={() => setEditing(null)}
              >
                Cancel
              </Button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  );
}
