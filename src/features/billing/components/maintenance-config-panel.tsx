"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { preservedSubmit } from "@/lib/form-submit";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import {
  createMaintenanceConfig,
  fetchMaintenanceConfigs,
  updateMaintenanceConfig,
} from "../api";
import { formatMoney } from "../format";

type MaintenanceConfigPanelProps = {
  societyId: string;
};

export function MaintenanceConfigPanel({
  societyId,
}: MaintenanceConfigPanelProps) {
  const queryClient = useQueryClient();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const configsQuery = useQuery({
    queryKey: ["maintenance-configs", societyId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) {
        throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      }
      return fetchMaintenanceConfigs(token, societyId);
    },
  });

  function onCreate(formData: FormData, form: HTMLFormElement) {
    const name = String(formData.get("name") ?? "").trim();
    const monthlyAmount = String(formData.get("monthlyAmount") ?? "").trim();
    const dueDayOfMonth = Number(formData.get("dueDayOfMonth"));
    const description = String(formData.get("description") ?? "").trim();
    const additionalAmount = String(
      formData.get("additionalAmount") ?? "",
    ).trim();
    const additionalDescription = String(
      formData.get("additionalDescription") ?? "",
    ).trim();

    const nextErrors: Record<string, string[]> = {};
    if (!name) nextErrors.name = ["Name is required."];
    if (!/^\d+(\.\d{1,2})?$/.test(monthlyAmount)) {
      nextErrors.monthlyAmount = ["Enter a valid amount (e.g. 1500.00)."];
    }
    if (!Number.isInteger(dueDayOfMonth) || dueDayOfMonth < 1 || dueDayOfMonth > 28) {
      nextErrors.dueDayOfMonth = ["Due day must be between 1 and 28."];
    }
    if (
      additionalAmount &&
      !/^\d+(\.\d{1,2})?$/.test(additionalAmount)
    ) {
      nextErrors.additionalAmount = ["Enter a valid amount."];
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
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
        await createMaintenanceConfig(token, societyId, {
          name,
          monthlyAmount,
          dueDayOfMonth,
          description: description || undefined,
          additionalAmount: additionalAmount || undefined,
          additionalDescription: additionalDescription || undefined,
        });
        setStatus("success");
        setMessage("Maintenance configuration saved.");
        form.reset();
        await queryClient.invalidateQueries({
          queryKey: ["maintenance-configs", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to save configuration.",
        );
      }
    });
  }

  function toggleStatus(configId: string, next: "ACTIVE" | "INACTIVE") {
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }
        await updateMaintenanceConfig(token, configId, { status: next });
        setStatus("success");
        setMessage(
          next === "ACTIVE"
            ? "Configuration activated."
            : "Configuration deactivated.",
        );
        await queryClient.invalidateQueries({
          queryKey: ["maintenance-configs", societyId],
        });
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to update configuration.",
        );
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          Maintenance configuration
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Monthly amount, due day, and optional additional charges for this
          society. Changes do not recalculate historical invoices.
        </p>
      </div>

      <AuthStatus status={status} message={message} />

      <form noValidate onSubmit={preservedSubmit(onCreate)} className="space-y-4 rounded-lg border border-border bg-card p-4">
        <Field id="name" name="name" label="Name" error={fieldErrors.name} />
        <Field
          id="description"
          name="description"
          label="Billing description"
          error={fieldErrors.description}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="monthlyAmount"
            name="monthlyAmount"
            label="Monthly amount (INR)"
            inputMode="decimal"
            placeholder="1500.00"
            error={fieldErrors.monthlyAmount}
          />
          <Field
            id="dueDayOfMonth"
            name="dueDayOfMonth"
            label="Due day of month"
            type="number"
            min={1}
            max={28}
            defaultValue={10}
            error={fieldErrors.dueDayOfMonth}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="additionalAmount"
            name="additionalAmount"
            label="Additional charge (optional)"
            inputMode="decimal"
            placeholder="0.00"
            error={fieldErrors.additionalAmount}
          />
          <Field
            id="additionalDescription"
            name="additionalDescription"
            label="Additional charge description"
            error={fieldErrors.additionalDescription}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Billing cycle is monthly. Scope defaults to the whole society.
        </p>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save configuration"}
        </Button>
      </form>

      <section className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">
          Existing configurations
        </h3>
        {configsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground" role="status">
            Loading configurations…
          </p>
        ) : null}
        {configsQuery.isError ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {configsQuery.error instanceof ApiError
              ? configsQuery.error.message
              : "Unable to load configurations."}
          </p>
        ) : null}
        {!configsQuery.isLoading &&
        !configsQuery.isError &&
        (configsQuery.data?.length ?? 0) === 0 ? (
          <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
            No maintenance configurations yet.
          </p>
        ) : null}
        <ul className="space-y-2">
          {(configsQuery.data ?? []).map((config) => (
            <li
              key={config.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {config.name}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({config.status})
                  </span>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatMoney(config.monthlyAmount)} / month · due day{" "}
                  {config.dueDayOfMonth}
                  {Number(config.additionalAmount) > 0
                    ? ` · +${formatMoney(config.additionalAmount)}`
                    : ""}
                </p>
                {config.description ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {config.description}
                  </p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() =>
                  toggleStatus(
                    config.id,
                    config.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                  )
                }
              >
                {config.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
