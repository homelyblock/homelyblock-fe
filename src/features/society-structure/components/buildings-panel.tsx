"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { createBuilding, fetchBuildings, updateBuilding } from "../api";
import { createBuildingSchema } from "../schemas";
import type { Building } from "../types";

type BuildingsPanelProps = {
  societyId: string;
  canManage: boolean;
};

export function BuildingsPanel({ societyId, canManage }: BuildingsPanelProps) {
  const queryClient = useQueryClient();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [editing, setEditing] = useState<Building | null>(null);

  const query = useQuery({
    queryKey: ["buildings", societyId],
    enabled: canManage,
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBuildings(token, societyId);
    },
  });

  function onSubmit(formData: FormData) {
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
    startTransition(async () => {
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
        Loading buildings…
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
          : "Unable to load buildings."}
      </p>
    );
  }

  const buildings = query.data ?? [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Buildings / wings</h2>
        {buildings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No buildings yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {buildings.map((building) => (
              <li
                key={building.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {building.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Code {building.code}</p>
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
                    Edit
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {canManage ? (
        <form action={onSubmit} className="space-y-4 rounded-lg border border-border bg-card px-5 py-5">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {editing ? "Edit building" : "Add building"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Codes must be unique within this society.
            </p>
          </div>
          <Field
            id="building-name"
            name="name"
            label="Name"
            defaultValue={editing?.name ?? ""}
            key={`name-${editing?.id ?? "new"}`}
            error={fieldErrors.name}
          />
          <Field
            id="building-code"
            name="code"
            label="Code"
            defaultValue={editing?.code ?? ""}
            key={`code-${editing?.id ?? "new"}`}
            error={fieldErrors.code}
          />
          <AuthStatus status={status} message={message} />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : editing ? "Update building" : "Create building"}
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
