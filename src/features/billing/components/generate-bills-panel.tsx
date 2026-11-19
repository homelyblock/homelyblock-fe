"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import {
  fetchMaintenanceConfigs,
  generateBills,
  previewBills,
  publishPeriod,
  type GenerateBillsResult,
} from "../api";
import { formatMoney, formatPeriod } from "../format";

type GenerateBillsPanelProps = {
  societyId: string;
};

export function GenerateBillsPanel({ societyId }: GenerateBillsPanelProps) {
  const now = useMemo(() => new Date(), []);
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [preview, setPreview] = useState<GenerateBillsResult | null>(null);
  const [generated, setGenerated] = useState<GenerateBillsResult | null>(null);

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

  const activeConfigs = (configsQuery.data ?? []).filter(
    (config) => config.status === "ACTIVE",
  );

  function run(
    mode: "preview" | "generate" | "publish",
    formData: FormData,
  ) {
    const configId = String(formData.get("configId") ?? "");
    const periodYear = Number(formData.get("periodYear"));
    const periodMonth = Number(formData.get("periodMonth"));
    const discountAmount = String(formData.get("discountAmount") ?? "").trim();

    if (mode !== "publish" && !configId) {
      setStatus("error");
      setMessage("Select an active maintenance configuration.");
      return;
    }
    if (
      !Number.isInteger(periodYear) ||
      !Number.isInteger(periodMonth) ||
      periodMonth < 1 ||
      periodMonth > 12
    ) {
      setStatus("error");
      setMessage("Enter a valid billing period.");
      return;
    }
    if (discountAmount && !/^\d+(\.\d{1,2})?$/.test(discountAmount)) {
      setStatus("error");
      setMessage("Discount must be a valid amount.");
      return;
    }

    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) {
          throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        }

        if (mode === "publish") {
          const result = await publishPeriod(
            token,
            societyId,
            periodYear,
            periodMonth,
          );
          setStatus("success");
          setMessage(
            `Published ${result.publishedCount} draft invoice${result.publishedCount === 1 ? "" : "s"} for ${formatPeriod(periodYear, periodMonth)}.`,
          );
          return;
        }

        const payload = {
          configId,
          periodYear,
          periodMonth,
          discountAmount: discountAmount || undefined,
        };

        if (mode === "preview") {
          const result = await previewBills(token, societyId, payload);
          setPreview(result);
          setGenerated(null);
          setStatus("success");
          setMessage(
            `Preview ready: ${result.createdCount} bill${result.createdCount === 1 ? "" : "s"} would be created` +
              (result.alreadyExisting
                ? `, ${result.alreadyExisting} already exist`
                : "") +
              (result.skippedIneligible
                ? `, ${result.skippedIneligible} ineligible`
                : "") +
              ".",
          );
          return;
        }

        const result = await generateBills(token, societyId, payload);
        setGenerated(result);
        setPreview(null);
        setStatus("success");
        setMessage(
          `Generated ${result.createdCount} draft invoice${result.createdCount === 1 ? "" : "s"}` +
            (result.alreadyExisting
              ? `, ${result.alreadyExisting} already existed`
              : "") +
            (result.skippedIneligible
              ? `, ${result.skippedIneligible} ineligible`
              : "") +
            (result.failed.length
              ? `, ${result.failed.length} failed`
              : "") +
            ".",
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to complete billing action.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Generate bills</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Preview eligible units, generate draft invoices in a transaction, then
          publish for the billing period.
        </p>
      </div>

      <AuthStatus status={status} message={message} />

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
      {!configsQuery.isLoading && activeConfigs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
          Create an active maintenance configuration before generating bills.{" "}
          <Link
            href={`/societies/${societyId}/billing/config`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Open configuration
          </Link>
        </p>
      ) : null}

      <form
        className="space-y-4 rounded-lg border border-border bg-card p-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="space-y-1.5">
          <label
            htmlFor="configId"
            className="block text-sm font-medium text-foreground"
          >
            Configuration
          </label>
          <select
            id="configId"
            name="configId"
            className={controlClassName}
            defaultValue={activeConfigs[0]?.id ?? ""}
          >
            <option value="" disabled>
              Select configuration
            </option>
            {activeConfigs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.name} · {formatMoney(config.monthlyAmount)}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            id="periodYear"
            name="periodYear"
            label="Year"
            type="number"
            defaultValue={now.getFullYear()}
          />
          <div className="space-y-1.5">
            <label
              htmlFor="periodMonth"
              className="block text-sm font-medium text-foreground"
            >
              Month
            </label>
            <select
              id="periodMonth"
              name="periodMonth"
              defaultValue={now.getMonth() + 1}
              className={controlClassName}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ),
              )}
            </select>
          </div>
          <Field
            id="discountAmount"
            name="discountAmount"
            label="Discount (optional)"
            inputMode="decimal"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={pending || activeConfigs.length === 0}
            aria-busy={pending}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form || pending) return;
              run("preview", new FormData(form));
            }}
          >
            Preview
          </Button>
          <Button
            type="button"
            disabled={pending || activeConfigs.length === 0}
            aria-busy={pending}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form || pending) return;
              run("generate", new FormData(form));
            }}
          >
            Generate drafts
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            aria-busy={pending}
            onClick={(event) => {
              const form = event.currentTarget.form;
              if (!form || pending) return;
              run("publish", new FormData(form));
            }}
          >
            Publish period
          </Button>
        </div>
      </form>

      {(preview || generated) && (
        <section className="space-y-3">
          <h3 className="text-base font-semibold text-foreground">
            {preview ? "Preview" : "Generated drafts"}
          </h3>
          <ul className="space-y-2">
            {(preview ?? generated)?.items.map((bill, index) => (
              <li
                key={bill.id || `${bill.unitId}-${index}`}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground"
              >
                {bill.buildingCode ?? "—"}-{bill.unitNumber ?? "—"} · total{" "}
                {formatMoney(bill.totalAmount)}
                {bill.invoiceNumber ? ` · ${bill.invoiceNumber}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
