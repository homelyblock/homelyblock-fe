import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { safeAuthRedirectPath } from "../safe-redirect";
import { loadSignInContinuation } from "../sign-in-gate";
import type { AuthEntry } from "../account-routing";
import { AuthFormShell } from "./auth-form-shell";
import { SignInAlerts } from "./sign-in-alerts";
import { SignInForm } from "./sign-in-form";

type SignInScreenProps = {
  audience: AuthEntry;
  copy: "signIn" | "admin";
  next?: string;
  error?: string;
  footer?: ReactNode;
};

export async function SignInScreen({
  audience,
  copy,
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
    <AuthFormShell copy={copy} footer={footer}>
      <SignInAlerts error={error} configured={configured} />
      {configured ? (
        <div className="space-y-4">
          {continuation.status === "rejected" ? (
            <Alert>{continuation.message}</Alert>
          ) : null}
          <SignInForm audience={audience} nextPath={requestedNext} />
        </div>
      ) : null}
    </AuthFormShell>
  );
}
