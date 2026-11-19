import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { safeAuthRedirectPath } from "../safe-redirect";
import { loadSignInContinuation } from "../sign-in-gate";
import type { AuthEntry } from "../account-routing";
import { AuthFormShell } from "./auth-form-shell";
import { SignInForm } from "./sign-in-form";

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
  if (continuation.status === "continue") {
    redirect(continuation.href);
  }

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
