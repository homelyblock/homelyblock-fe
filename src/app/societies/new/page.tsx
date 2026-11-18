import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { CreateSocietyForm } from "@/features/societies/components/create-society-form";
import { fetchMe } from "@/features/societies/api";
import { getServerAccessToken } from "@/features/auth/server-session";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";

export const instant = false;

export default async function CreateSocietyPage() {
  if (!getSupabasePublicConfig()) {
    redirect("/sign-in");
  }

  const token = await getServerAccessToken();
  if (!token) {
    redirect("/sign-in");
  }

  let isPlatformOwner = false;
  try {
    const me = await fetchMe(token);
    isPlatformOwner = me.platformRole === "PLATFORM_OWNER";
  } catch (error) {
    redirectForLoadFailure(error);
  }

  if (!isPlatformOwner) {
    redirect("/forbidden");
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Create society
      </h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Assign an existing user as the first society admin. The API rejects
        unauthorized create attempts.
      </p>
      <div className="rounded-lg border border-border bg-card px-6 py-6">
        <CreateSocietyForm />
      </div>
    </div>
  );
}
