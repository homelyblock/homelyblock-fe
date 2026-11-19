import type { Metadata } from "next";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell, SignUpFooter } from "@/features/auth/components/auth-form-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const metadata: Metadata = {
  title: "Create account — HomelyBlock",
  description: "Register as a society administrator or a resident. Platform owner accounts are not created here.",
};

export const instant = false;

export default function SignUpPage() {
  const configured = getSupabasePublicConfig() !== null;

  return (
    <AuthFormShell wide copy="signUp" footer={<SignUpFooter />}>
      {!configured ? (
        <Alert tone="warning">
          Sign-up is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
        </Alert>
      ) : (
        <SignUpForm />
      )}
    </AuthFormShell>
  );
}
