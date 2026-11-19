import type { Metadata } from "next";
import { privateRobots } from "@/features/marketing/public-metadata";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell, ResetFooter } from "@/features/auth/components/auth-form-shell";
import { PasswordResetForm } from "@/features/auth/components/password-reset-form";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const metadata: Metadata = privateRobots;

export const instant = false;

export default function PasswordResetPage() {
  const configured = getSupabasePublicConfig() !== null;

  return (
    <AuthFormShell copy="reset" footer={<ResetFooter />}>
      {!configured ? (
        <Alert tone="warning">
          Password reset is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </Alert>
      ) : (
        <PasswordResetForm />
      )}
    </AuthFormShell>
  );
}
