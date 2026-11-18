import type { Metadata } from "next";
import Link from "next/link";
import { privateRobots } from "@/features/marketing/public-metadata";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { PasswordResetForm } from "@/features/auth/components/password-reset-form";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const metadata: Metadata = privateRobots;

export const instant = false;

export default function PasswordResetPage() {
  const configured = getSupabasePublicConfig() !== null;

  return (
    <AuthFormShell
      title="Reset password"
      description="We will email a link if this address has an account. The message does not reveal whether the address is registered."
      footer={
        <p>
          Remembered it?{" "}
          <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
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
