"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { AuthStatus } from "@/features/auth/components/auth-status";
import { Field } from "@/features/auth/components/field";
import { getBrowserAccessToken } from "@/features/auth/browser-session";
import { ApiError } from "@/services/api-client";
import { updateProfile } from "../api";
import { profileFormSchema } from "../schemas";
import type { Profile } from "../types";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  function onSubmit(formData: FormData) {
    const parsed = profileFormSchema.safeParse({
      displayName: formData.get("displayName"),
      phone: formData.get("phone") ?? "",
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
    startTransition(async () => {
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
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <Field
        id="displayName"
        name="displayName"
        label="Display name"
        defaultValue={profile.displayName}
        error={fieldErrors.displayName}
        required
      />
      <Field
        id="email"
        name="email"
        label="Email"
        defaultValue={profile.email ?? ""}
        disabled
        readOnly
      />
      <p className="-mt-2 text-xs text-muted-foreground">
        Email is managed by your sign-in account and cannot be changed here.
      </p>
      <Field
        id="phone"
        name="phone"
        label="Phone"
        defaultValue={profile.phone ?? ""}
        error={fieldErrors.phone}
        placeholder="+91…"
      />
      <AuthStatus status={status} message={message} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => router.push("/profile")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
