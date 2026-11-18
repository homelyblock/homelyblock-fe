import Link from "next/link";
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { safeAuthRedirectPath } from "../safe-redirect";
import { loadSignInContinuation } from "../sign-in-gate";
import type { AuthEntry } from "../account-routing";
import { AuthFormShell } from "./auth-form-shell";
import { SignInForm } from "./sign-in-form";
import { SignOutButton } from "./sign-out-button";

type SignInScreenProps = {
  audience: AuthEntry;
  title: string;
  description: string;
  next?: string;
  error?: string;
  footer?: ReactNode;
};

export async function SignInScreen({
  audience,
  title,
  description,
  next,
  error,
  footer,
}: SignInScreenProps) {
  const configured = getSupabasePublicConfig() !== null;
  const requestedNext = next ? safeAuthRedirectPath(next) : null;
  const continuation = configured
    ? await loadSignInContinuation(audience, requestedNext)
    : { status: "anonymous" as const };
  const returnTo = audience === "platform" ? "/admin/sign-in" : "/sign-in";

  return (
    <AuthFormShell title={title} description={description} footer={footer}>
      {error === "auth_callback" ? (
        <Alert>
          That confirmation link could not be completed. Request a new email or sign in with your password.
        </Alert>
      ) : null}
      {!configured ? (
        <Alert tone="warning">
          Sign-in is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </Alert>
      ) : continuation.status === "continue" ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Signed in as <span className="font-medium">{continuation.email}</span>.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href={continuation.href}
              className="inline-flex h-11 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
            >
              Continue
            </Link>
            <SignOutButton returnTo={returnTo} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {continuation.status === "rejected" ? (
            <Alert>{continuation.message}</Alert>
          ) : null}
          <SignInForm audience={audience} nextPath={requestedNext} />
        </div>
      )}
    </AuthFormShell>
  );
}
