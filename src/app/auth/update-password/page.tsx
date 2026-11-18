import { Alert } from "@/components/ui/alert";
import { AuthFormShell } from "@/features/auth/components/auth-form-shell";
import { UpdatePasswordForm } from "@/features/auth/components/update-password-form";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const instant = false;

export default function UpdatePasswordPage() {
  const configured = getSupabasePublicConfig() !== null;

  return (
    <AuthFormShell
      title="Choose a new password"
      description="Use at least 8 characters. After saving, sign in with the new password."
    >
      {!configured ? (
        <Alert tone="warning">Password update is not configured.</Alert>
      ) : (
        <UpdatePasswordForm />
      )}
    </AuthFormShell>
  );
}
