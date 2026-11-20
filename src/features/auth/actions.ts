"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "@/services/api-client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { fetchMe } from "@/features/societies/api";
import type { MeResponse } from "@/features/societies/types";
import { rethrowIfNavigation } from "@/features/shell/navigation";
import {
  AUTH_ENTRY_COOKIE,
  homePathForAccount,
  signOutDestination,
  signupIntentPayload,
  signupMetadata,
  type AuthEntry,
} from "./account-routing";
import { finishStoredSignup } from "./finish-signup";
import { submitOnboarding } from "./onboarding";
import { storeSignupIntent } from "./store-signup-intent";
import { safeAuthRedirectPath } from "./safe-redirect";
import {
  passwordResetRequestSchema,
  passwordUpdateSchema,
  signInSchema,
  signUpSchema,
} from "./schemas";
import { getServerAccessToken } from "./server-session";

export type AuthActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

function textField(formData: FormData, name: string): string | undefined {
  const value = formData.get(name);
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function onboardingFields(formData: FormData) {
  return {
    accountType: textField(formData, "accountType") ?? "",
    societyName: textField(formData, "societyName"),
    city: textField(formData, "city"),
    state: textField(formData, "state"),
    phone: textField(formData, "phone"),
  };
}

async function rememberAuthEntry(entry: AuthEntry): Promise<void> {
  const jar = await cookies();
  jar.set(AUTH_ENTRY_COOKIE, entry, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

function fieldErrorsFromZod(
  error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } },
): Record<string, string[]> {
  const flattened = error.flatten().fieldErrors;
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flattened)) {
    if (value && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const audience = formData.get("audience") === "platform" ? "platform" : "member";
  let me: MeResponse;

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error || !data.session?.access_token) {
      return {
        status: "error",
        message: error?.message || "Unable to sign in with those credentials.",
      };
    }

    me = await fetchMe(data.session.access_token);
    if (audience === "platform" && me.platformRole !== "PLATFORM_OWNER") {
      await supabase.auth.signOut();
      return {
        status: "error",
        message:
          "This entrance accepts only the provisioned platform owner account.",
      };
    }
    if (audience === "member" && me.platformRole === "PLATFORM_OWNER") {
      await supabase.auth.signOut();
      return {
        status: "error",
        message:
          "Platform owner accounts cannot sign in here. Use the provisioned administrative entrance.",
      };
    }
    if (audience === "member") {
      me = await finishStoredSignup(data.session.access_token, me);
    }
    await rememberAuthEntry(audience);
  } catch (error) {
    rethrowIfNavigation(error);
    return {
      status: "error",
      message:
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Supabase Auth is not configured.",
    };
  }

  const nextValue = formData.get("next");
  const fallback = homePathForAccount(me);
  redirect(
    typeof nextValue === "string" && nextValue.trim().length > 0
      ? safeAuthRedirectPath(nextValue, fallback)
      : fallback,
  );
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    fullName: textField(formData, "fullName") ?? "",
    email: textField(formData, "email") ?? "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    ...onboardingFields(formData),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim() || undefined;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: signupMetadata(parsed.data),
        emailRedirectTo: origin
          ? `${origin.replace(/\/$/, "")}/auth/callback`
          : undefined,
      },
    });

    if (error) {
      return {
        status: "error",
        message: error.message || "Unable to create an account.",
      };
    }

    if (!data.user?.id) {
      return {
        status: "error",
        message:
          "The account was created, but the signup choice could not be saved. Contact support before signing in.",
      };
    }

    try {
      await storeSignupIntent(signupIntentPayload(data.user.id, parsed.data));
    } catch (intentError) {
      const message =
        intentError instanceof ApiError
          ? intentError.message
          : intentError instanceof Error
            ? intentError.message
            : "The signup choice could not be saved.";
      return { status: "error", message };
    }

    if (data.session?.access_token) {
      try {
        const me = await submitOnboarding(data.session.access_token);
        await rememberAuthEntry("member");
        redirect(homePathForAccount(me));
      } catch (error) {
        rethrowIfNavigation(error);
        const message =
          error instanceof ApiError
            ? error.message
            : "Account setup could not be completed.";
        redirect(`/onboarding?error=${encodeURIComponent(message.slice(0, 180))}`);
      }
    }

    return {
      status: "success",
      message:
        "Check your email to confirm your account, then sign in. The role and society details from this form are saved and will be applied on your first sign-in.",
    };
  } catch (error) {
    rethrowIfNavigation(error);
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Supabase Auth is not configured.",
    };
  }
}

export async function completeOnboardingAction(): Promise<AuthActionState> {
  const token = await getServerAccessToken();
  if (!token) {
    redirect("/sign-in");
  }

  try {
    const me = await submitOnboarding(token);
    await rememberAuthEntry("member");
    redirect(homePathForAccount(me));
  } catch (error) {
    rethrowIfNavigation(error);
    return {
      status: "error",
      message:
        error instanceof ApiError
          ? error.message
          : "Account setup could not be completed.",
    };
  }
}

export async function requestPasswordResetAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordResetRequestSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (!siteUrl) {
      return {
        status: "error",
        message:
          "NEXT_PUBLIC_SITE_URL is not configured. Set the public site origin for password-reset emails.",
      };
    }
    let origin: string;
    try {
      const parsedUrl = new URL(siteUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("invalid protocol");
      }
      origin = parsedUrl.origin;
    } catch {
      return {
        status: "error",
        message: "NEXT_PUBLIC_SITE_URL must be an absolute http(s) origin.",
      };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(
      parsed.data.email,
      {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/auth/update-password")}`,
      },
    );

    if (error) {
      return {
        status: "error",
        message: error.message || "Unable to start password reset.",
      };
    }

    return {
      status: "success",
      message:
        "If an account exists for that email, a reset link has been sent.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Supabase Auth is not configured.",
    };
  }
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = passwordUpdateSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data.password,
    });

    if (error) {
      return {
        status: "error",
        message: error.message || "Unable to update password.",
      };
    }
    await supabase.auth.signOut();
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Supabase Auth is not configured.",
    };
  }

  redirect("/sign-in?error=password_updated");
}

export async function signOutAction(formData: FormData): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore missing configuration during sign-out.
  }
  redirect(signOutDestination(formData.get("returnTo")));
}
