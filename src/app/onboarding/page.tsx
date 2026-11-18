import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { ApiError } from "@/services/api-client";
import { OnboardingForm } from "@/features/auth/components/onboarding-form";
import { homePathForAccount } from "@/features/auth/account-routing";
import { finishStoredSignup } from "@/features/auth/finish-signup";
import { loadCurrentSession } from "@/features/shell/access";
import { rethrowIfNavigation } from "@/features/shell/navigation";

export const instant = false;

type OnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const { token, me } = await loadCurrentSession();
  const params = await searchParams;
  let current = me;
  let setupError = params.error?.trim().slice(0, 180);

  if (!me.accountType && me.platformRole !== "PLATFORM_OWNER") {
    try {
      current = await finishStoredSignup(token, me);
    } catch (error) {
      rethrowIfNavigation(error);
      setupError =
        error instanceof ApiError
          ? error.message
          : "Account setup could not be completed.";
    }
  }

  const home = homePathForAccount(current);
  if (home !== "/onboarding") {
    redirect(home);
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Finish account setup
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Account setup uses the role and society details saved when you registered. Those details cannot be changed from this page.
        </p>
      </div>
      {setupError ? <Alert>{setupError}</Alert> : null}
      <OnboardingForm />
    </div>
  );
}
