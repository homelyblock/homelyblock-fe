"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import {
  activateService,
  deactivateService,
  fetchService,
} from "../api";
import { formatIndianPhone } from "@/lib/indian-phone";
import { telHref, whatsappHref } from "../links";

type ServiceDetailViewProps = {
  societyId: string;
  serviceId: string;
  canManage: boolean;
};

export function ServiceDetailView({
  societyId,
  serviceId,
  canManage,
}: ServiceDetailViewProps) {
  const queryClient = useQueryClient();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const query = useQuery({
    queryKey: ["service", serviceId],
    queryFn: async () => {
      const token = await getBrowserAccessToken();
      if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
      return fetchService(token, serviceId);
    },
  });

  function refresh() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["service", serviceId] }),
      queryClient.invalidateQueries({ queryKey: ["services", societyId] }),
    ]);
  }

  if (query.isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading provider…
      </p>
    );
  }
  if (query.isError || !query.data) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
      >
        {query.error instanceof ApiError
          ? query.error.message
          : "Unable to load provider."}
      </p>
    );
  }

  const provider = query.data;
  const whatsapp = provider.whatsappNumber
    ? whatsappHref(provider.whatsappNumber)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {provider.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {provider.category.replaceAll("_", " ")}
            {!provider.isActive ? " · Inactive" : ""}
          </p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/societies/${societyId}/services/${serviceId}/edit`}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted/60"
            >
              Edit
            </Link>
            {provider.isActive ? (
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setConfirmDeactivate(true)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  guard(async () => {
                    try {
                      const token = await getBrowserAccessToken();
                      if (!token) {
                        throw new ApiError(
                          "Sign in required",
                          401,
                          "UNAUTHORIZED",
                        );
                      }
                      await activateService(token, serviceId);
                      setStatus("success");
                      setMessage("Provider activated.");
                      await refresh();
                    } catch (error) {
                      setStatus("error");
                      setMessage(
                        error instanceof ApiError
                          ? error.message
                          : "Unable to activate provider.",
                      );
                    }
                  });
                }}
              >
                Activate
              </Button>
            )}
          </div>
        ) : null}
      </div>

      <AuthStatus status={status} message={message} />

      <article className="space-y-3 rounded-lg border border-border bg-card p-4 text-sm text-foreground">
        {provider.description ? (
          <p className="whitespace-pre-wrap">{provider.description}</p>
        ) : null}
        {provider.contactPerson ? (
          <p>
            <span className="font-medium text-foreground">Contact:</span>{" "}
            {provider.contactPerson}
          </p>
        ) : null}
        <p>
          <span className="font-medium text-foreground">Phone:</span>{" "}
          <a
            href={telHref(provider.phone)}
            className="underline-offset-4 hover:underline"
          >
            {formatIndianPhone(provider.phone)}
          </a>
        </p>
        {whatsapp ? (
          <p>
            <span className="font-medium text-foreground">WhatsApp:</span>{" "}
            <a
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:underline"
            >
              {provider.whatsappNumber}
            </a>
          </p>
        ) : null}
        {provider.address ? (
          <p>
            <span className="font-medium text-foreground">Address:</span>{" "}
            {provider.address}
          </p>
        ) : null}
      </article>
      <ConfirmDialog
        open={confirmDeactivate}
        title="Deactivate this provider?"
        description="Residents will no longer see it in the directory."
        confirmLabel="Deactivate"
        pending={pending}
        onCancel={() => setConfirmDeactivate(false)}
        onConfirm={() => {
          setConfirmDeactivate(false);
          guard(async () => {
            try {
              const token = await getBrowserAccessToken();
              if (!token) {
                throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
              }
              await deactivateService(token, serviceId);
              setStatus("success");
              setMessage("Provider deactivated.");
              await refresh();
            } catch (error) {
              setStatus("error");
              setMessage(
                error instanceof ApiError
                  ? error.message
                  : "Unable to deactivate provider.",
              );
            }
          });
        }}
      />
    </div>
  );
}
