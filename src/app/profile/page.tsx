import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { fetchProfile } from "@/features/profile/api";
import { ProfileView } from "@/features/profile/components/profile-view";

export const instant = false;

export default async function ProfilePage() {
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
      <ProfileView profile={profile} />
    </div>
  );
}
