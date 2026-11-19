"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery } from "@tanstack/react-query";
import { preservedSubmit } from "@/lib/form-submit";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName, textareaClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import {
  fetchBuildings,
  fetchUnits,
} from "@/features/society-structure/api";
import { ApiError } from "@/services/api-client";
import { createNotice, updateNotice } from "../api";
import { noticeFormSchema } from "../schemas";
import type { Notice, NoticeAudienceType } from "../types";

type NoticeFormProps = {
  societyId: string;
  notice?: Notice;
};

export function NoticeForm({ societyId, notice }: NoticeFormProps) {
  const router = useRouter();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [audienceType, setAudienceType] = useState<NoticeAudienceType>(
    notice?.audienceType ?? "SOCIETY",
  );
  const [buildingId, setBuildingId] = useState(
    notice?.targetBuildingId ?? "",
  );

  const buildingsQuery = useQuery({
    queryKey: ["buildings", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchBuildings(token, societyId);
    },
  });

  const unitsQuery = useQuery({
    queryKey: ["units", societyId, buildingId || "all"],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchUnits(token, societyId, buildingId || undefined);
    },
  });

  const units = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data]);

  function onSubmit(formData: FormData) {
    const parsed = noticeFormSchema.safeParse({
      title: formData.get("title"),
      body: formData.get("body"),
      category: formData.get("category"),
      audienceType: formData.get("audienceType"),
      targetBuildingId: formData.get("targetBuildingId") || "",
      targetUnitId: formData.get("targetUnitId") || "",
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

        const base = {
          title: parsed.data.title,
          body: parsed.data.body,
          category: parsed.data.category,
          audienceType: parsed.data.audienceType,
        };

        const saved = notice
          ? await updateNotice(token, notice.id, {
              ...base,
              ...(parsed.data.audienceType === "SOCIETY"
                ? { targetBuildingId: null, targetUnitId: null }
                : {}),
              ...(parsed.data.audienceType === "BUILDING"
                ? {
                    targetBuildingId: parsed.data.targetBuildingId || null,
                    targetUnitId: null,
                  }
                : {}),
              ...(parsed.data.audienceType === "UNIT"
                ? {
                    targetUnitId: parsed.data.targetUnitId || null,
                    ...(parsed.data.targetBuildingId
                      ? { targetBuildingId: parsed.data.targetBuildingId }
                      : {}),
                  }
                : {}),
            })
          : await createNotice(token, societyId, {
              ...base,
              ...(parsed.data.audienceType === "BUILDING"
                ? { targetBuildingId: parsed.data.targetBuildingId }
                : {}),
              ...(parsed.data.audienceType === "UNIT"
                ? {
                    targetUnitId: parsed.data.targetUnitId,
                    ...(parsed.data.targetBuildingId
                      ? { targetBuildingId: parsed.data.targetBuildingId }
                      : {}),
                  }
                : {}),
            });

        setStatus("success");
        setMessage(notice ? "Draft updated." : "Draft created.");
        router.push(`/societies/${societyId}/notices/${saved.id}`);
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to save notice.",
        );
      }
    });
  }

  return (
    <form
      noValidate onSubmit={preservedSubmit(onSubmit)}
      className="space-y-4 rounded-lg border border-border bg-card px-5 py-5"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          {notice ? "Edit draft" : "Create notice"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Notices are saved as drafts until you publish them.
        </p>
      </div>

      <Field
        id="notice-title"
        name="title"
        label="Title"
        defaultValue={notice?.title ?? ""}
        error={fieldErrors.title}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="notice-body"
          className="block text-sm font-medium text-foreground"
        >
          Content
        </label>
        <textarea
          id="notice-body"
          name="body"
          rows={8}
          defaultValue={notice?.body ?? ""}
          aria-invalid={Boolean(fieldErrors.body?.length)}
          className={textareaClassName}
        />
        {fieldErrors.body?.length ? (
          <p className="text-sm text-destructive">{fieldErrors.body[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="notice-category"
            className="block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <select
            id="notice-category"
            name="category"
            defaultValue={notice?.category ?? "GENERAL"}
            className={controlClassName}
          >
            <option value="GENERAL">GENERAL</option>
            <option value="MAINTENANCE">MAINTENANCE</option>
            <option value="EVENT">EVENT</option>
            <option value="EMERGENCY">EMERGENCY</option>
            <option value="IMPORTANT">IMPORTANT</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="notice-audience"
            className="block text-sm font-medium text-foreground"
          >
            Audience
          </label>
          <select
            id="notice-audience"
            name="audienceType"
            value={audienceType}
            onChange={(event) =>
              setAudienceType(event.target.value as NoticeAudienceType)
            }
            className={controlClassName}
          >
            <option value="SOCIETY">Entire society</option>
            <option value="BUILDING">Specific building</option>
            <option value="UNIT">Specific unit</option>
          </select>
        </div>
      </div>

      {audienceType === "BUILDING" || audienceType === "UNIT" ? (
        <div className="space-y-1.5">
          <label
            htmlFor="notice-building"
            className="block text-sm font-medium text-foreground"
          >
            Building
          </label>
          <select
            id="notice-building"
            name="targetBuildingId"
            value={buildingId}
            onChange={(event) => setBuildingId(event.target.value)}
            className={controlClassName}
          >
            <option value="">Select a building</option>
            {(buildingsQuery.data ?? []).map((building) => (
              <option key={building.id} value={building.id}>
                {building.name} ({building.code})
              </option>
            ))}
          </select>
          {fieldErrors.targetBuildingId?.length ? (
            <p className="text-sm text-destructive">
              {fieldErrors.targetBuildingId[0]}
            </p>
          ) : null}
        </div>
      ) : null}

      {audienceType === "UNIT" ? (
        <div className="space-y-1.5">
          <label
            htmlFor="notice-unit"
            className="block text-sm font-medium text-foreground"
          >
            Unit
          </label>
          <select
            id="notice-unit"
            name="targetUnitId"
            defaultValue={notice?.targetUnitId ?? ""}
            className={controlClassName}
          >
            <option value="">Select a unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unitNumber}
              </option>
            ))}
          </select>
          {fieldErrors.targetUnitId?.length ? (
            <p className="text-sm text-destructive">
              {fieldErrors.targetUnitId[0]}
            </p>
          ) : null}
        </div>
      ) : null}

      <AuthStatus status={status} message={message} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : notice ? "Update draft" : "Save draft"}
      </Button>
    </form>
  );
}
