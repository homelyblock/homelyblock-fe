import type { Metadata } from "next";
import { privateRobots } from "@/features/marketing/public-metadata";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell, ResetFooter } from "@/features/auth/components/auth-form-shell";
import { PasswordResetForm } from "@/features/auth/components/password-reset-form";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const metadata: Metadata = privateRobots;

export const instant = false;

type PasswordResetPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function PasswordResetPage({
  searchParams,
}: PasswordResetPageProps) {
  const configured = getSupabasePublicConfig() !== null;
  const params = await searchParams;

  return (
    <AuthFormShell copy="reset" footer={<ResetFooter />}>
      {params.error === "recovery" ? (
        <Alert tone="warning">
          That reset link is invalid or has expired. Request a new one.
        </Alert>
      ) : null}
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
