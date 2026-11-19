"use client";

import { useSubmitGuard } from "@/lib/use-submit-guard";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { fieldErrorMap, focusFirstInvalid, lockForm, preservedSubmit, unlockForm } from "@/lib/form-submit";
import { useI18n } from "@/i18n/provider";
import { ApiError } from "@/services/api-client";
import { updateProfile } from "../api";
import { profileFormSchema } from "../schemas";
import type { Profile } from "../types";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { pending, guard } = useSubmitGuard();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData, form: HTMLFormElement) {
    const parsed = profileFormSchema.safeParse({
      displayName: formData.get("displayName"),
      phone: formData.get("phone") ?? "",
    });

    if (!parsed.success) {
      const next = fieldErrorMap(parsed.error.flatten().fieldErrors);
      setFieldErrors(next);
      setStatus("error");
      setMessage("Check the highlighted fields.");
      focusFirstInvalid(form, next);
      return;
    }

    if (form.dataset.locked === "1") return;
    setFieldErrors({});
    lockForm(form);
    guard(async () => {
      try {
        const token = await getBrowserAccessToken();
        if (!token) throw new ApiError("Sign in required", 401, "UNAUTHORIZED");
        await updateProfile(token, {
          displayName: parsed.data.displayName,
          phone: parsed.data.phone,
        });
        setStatus("success");
        setMessage("Profile updated.");
        router.push("/profile");
        router.refresh();
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to update profile.",
        );
      } finally {
        unlockForm(form);
      }
    });
  }

  return (
    <form noValidate onSubmit={preservedSubmit(onSubmit)} className="space-y-4">
      <Field
        id="displayName"
        name="displayName"
        label={t("profile.displayName")}
        defaultValue={profile.displayName}
        error={fieldErrors.displayName}
        required
      />
      <Field
        id="email"
        name="email"
        label={t("profile.email")}
        defaultValue={profile.email ?? ""}
        disabled
        readOnly
      />
      <p className="-mt-2 text-xs text-muted-foreground">
        {t("profile.emailHint")}
      </p>
      <Field
        id="phone"
        name="phone"
        label={t("profile.phone")}
        defaultValue={profile.phone ?? ""}
        error={fieldErrors.phone}
        placeholder="+91…"
      />
      <AuthStatus status={status} message={message} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? t("profile.saving") : t("profile.save")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push("/profile")}
        >
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
