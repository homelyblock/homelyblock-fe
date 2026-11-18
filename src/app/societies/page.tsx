import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/services/api-client";
import { redirectForLoadFailure, rethrowIfNavigation } from "@/features/shell/navigation";
import { SocietyList } from "@/features/societies/components/society-list";
import { fetchMe } from "@/features/societies/api";
import { homePathForAccount } from "@/features/auth/account-routing";
import { finishStoredSignup } from "@/features/auth/finish-signup";
import {
  getServerAccessToken,
  redirectToSignIn,
} from "@/features/auth/server-session";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const instant = false;

export default async function SocietiesPage() {
  if (!getSupabasePublicConfig()) {
    redirect("/sign-in");
  }

  const token = await getServerAccessToken();
  if (!token) {
    await redirectToSignIn();
    throw new Error("Redirect failed");
  }

  let isPlatformOwner = false;
  try {
    const loaded = await fetchMe(token);
    const me =
      loaded.platformRole === "PLATFORM_OWNER"
        ? loaded
        : await finishStoredSignup(token, loaded);
    isPlatformOwner = me.platformRole === "PLATFORM_OWNER";
    if (!isPlatformOwner) {
      const home = homePathForAccount(me);
      if (home === "/onboarding" || home === "/onboarding/pending") {
        redirect(home);
      }
    }
  } catch (error) {
    rethrowIfNavigation(error);
    if (error instanceof ApiError && error.status === 400) {
      redirect(
        `/onboarding?error=${encodeURIComponent(error.message.slice(0, 180))}`,
      );
    }
    redirectForLoadFailure(error);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        title={isPlatformOwner ? "Platform overview" : "Your societies"}
        description={
          isPlatformOwner
            ? "Societies on this platform. Open one to review operations, or create a society and assign its first administrator."
            : "Societies where you have a membership. If this list is empty, an administrator still needs to assign you."
        }
        actions={
          isPlatformOwner ? (
            <Link href="/societies/new" className={buttonVariants()}>
              Create society
            </Link>
          ) : null
        }
      />
      <SocietyList isPlatformOwner={isPlatformOwner} />
    </div>
  );
}
