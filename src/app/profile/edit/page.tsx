import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { fetchProfile } from "@/features/profile/api";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const instant = false;

export default async function EditProfilePage() {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  let profile;
  try {
    profile = await fetchProfile(token);
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <p className="text-sm text-muted-foreground">
          <Link
            href="/profile"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to profile
          </Link>
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Edit profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your display name and phone. Email and roles stay
              protected.
            </p>
          </div>
          <ProfileForm profile={profile} />
        </div>
    </div>
  );
}
