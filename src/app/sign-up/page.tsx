import type { Metadata } from "next";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const metadata: Metadata = {
  title: "Create account — LivingSpace",
  description: "Register as a society administrator or a resident. Platform owner accounts are not created here.",
};

export const instant = false;

export default function SignUpPage() {
  const configured = getSupabasePublicConfig() !== null;

  return (
    <AuthFormShell
      wide
      title="Create account"
      description="Choose society administrator to create a new society, or resident to register a login that an administrator can connect to a home. The platform owner account is not created here."
      footer={
        <div className="space-y-2">
          <p>
            Creating an account means you agree to the{" "}
            <Link href="/terms" className="font-medium text-foreground underline-offset-4 hover:underline">
              terms and conditions
            </Link>
            , the{" "}
            <Link href="/privacy-policy" className="font-medium text-foreground underline-offset-4 hover:underline">
              privacy policy
            </Link>
            , and the{" "}
            <Link href="/acceptable-use" className="font-medium text-foreground underline-offset-4 hover:underline">
              acceptable use policy
            </Link>
            .
          </p>
          <p>
            Already registered?{" "}
            <Link href="/sign-in" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      }
    >
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
