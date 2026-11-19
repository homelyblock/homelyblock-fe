"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useRouter } from "next/navigation";
import { preservedSubmit } from "@/lib/form-submit";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { controlClassName, textareaClassName } from "@/components/ui/control";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { createService, updateService } from "../api";
import { serviceFormSchema } from "../schemas";
import { SERVICE_CATEGORIES, type ServiceProvider } from "../types";

type ServiceFormProps = {
  societyId: string;
  service?: ServiceProvider;
};

export function ServiceForm({ societyId, service }: ServiceFormProps) {
  const router = useRouter();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData) {
    const parsed = serviceFormSchema.safeParse({
      name: formData.get("name"),
      category: formData.get("category"),
      description: formData.get("description") || undefined,
      contactPerson: formData.get("contactPerson") || undefined,
      phone: formData.get("phone"),
      whatsappNumber: formData.get("whatsappNumber") || undefined,
      address: formData.get("address") || undefined,
    });

    if (!parsed.success) {
      const next: Record<string, string[]> = {};
      for (const [key, value] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        if (value?.length) next[key] = value;
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
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        const payload = {
          name: parsed.data.name,
          category: parsed.data.category as ServiceProvider["category"],
          description: parsed.data.description || undefined,
          contactPerson: parsed.data.contactPerson || undefined,
          phone: parsed.data.phone,
          whatsappNumber: parsed.data.whatsappNumber || undefined,
          address: parsed.data.address || undefined,
        };
        const saved = service
          ? await updateService(token, service.id, payload)
          : await createService(token, societyId, payload);
        setStatus("success");
        setMessage(service ? "Provider updated." : "Provider created.");
        router.push(`/societies/${societyId}/services/${saved.id}`);
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to save service provider.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {service ? "Edit provider" : "Add provider"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Maintain a society-specific directory entry for residents to call or
          message.
        </p>
      </div>
      <AuthStatus status={status} message={message} />
      <form
        noValidate onSubmit={preservedSubmit(onSubmit)}
        className="space-y-4 rounded-lg border border-border bg-card p-4"
      >
        <Field
          id="name"
          name="name"
          label="Provider name"
          defaultValue={service?.name}
          error={fieldErrors.name}
        />
        <div className="space-y-1.5">
          <label
            htmlFor="category"
            className="block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={service?.category ?? "OTHER"}
            className={controlClassName}
          >
            {SERVICE_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={service?.description ?? ""}
            className={textareaClassName}
          />
        </div>
        <Field
          id="contactPerson"
          name="contactPerson"
          label="Contact person"
          defaultValue={service?.contactPerson ?? ""}
          error={fieldErrors.contactPerson}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="phone"
            name="phone"
            label="Phone"
            defaultValue={service?.phone}
            error={fieldErrors.phone}
          />
          <Field
            id="whatsappNumber"
            name="whatsappNumber"
            label="WhatsApp number"
            defaultValue={service?.whatsappNumber ?? ""}
            error={fieldErrors.whatsappNumber}
          />
        </div>
        <Field
          id="address"
          name="address"
          label="Address"
          defaultValue={service?.address ?? ""}
          error={fieldErrors.address}
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : service ? "Save changes" : "Create provider"}
        </Button>
      </form>
    </div>
  );
}
