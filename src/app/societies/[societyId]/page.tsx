import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { SocietyDashboard } from "@/features/dashboard/components/society-dashboard";
import { getServerAccessToken } from "@/features/auth/server-session";
import { fetchMe } from "@/features/societies/api";

type SocietyDetailPageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function SocietyDetailPage({
  params,
}: SocietyDetailPageProps) {
  if (!getSupabasePublicConfig()) {
    redirect("/sign-in");
  }

  const token = await getServerAccessToken();
  if (!token) {
    redirect("/sign-in");
  }

  const { societyId } = await params;

  let mode: "admin" | "resident" | "profile" = "profile";
  let canEditProfile = false;
  try {
    const me = await fetchMe(token);
    const membership = me.memberships.find((item) => item.societyId === societyId);
    const isPlatformOwner = me.platformRole === "PLATFORM_OWNER";
    const isAdmin =
      isPlatformOwner ||
      (membership?.role === "SOCIETY_ADMIN" && membership.status === "ACTIVE");
    const isResident =
      membership?.role === "RESIDENT_USER" && membership.status === "ACTIVE";

    canEditProfile = isAdmin;
    if (isAdmin) mode = "admin";
    else if (isResident) mode = "resident";
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="space-y-6">
      <SocietyDashboard
            societyId={societyId}
            mode={mode}
            canEditProfile={canEditProfile}
          />
    </div>
  );
}
