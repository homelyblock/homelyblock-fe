import { BackLink } from "@/components/layout/back-link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { fetchMe } from "@/features/societies/api";
import { VisitorDetailView } from "@/features/visitors/components/visitor-detail";

type PageProps = {
  params: Promise<{ societyId: string; visitorId: string }>;
};

export const instant = false;

export default async function VisitorDetailPage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  const { societyId, visitorId } = await params;
  let canManage = false;
  let currentUserId = "";
  let residentUnitId: string | null = null;
  try {
    const me = await fetchMe(token);
    currentUserId = me.id;
    canManage =
      me.platformRole === "PLATFORM_OWNER" ||
      me.memberships.some(
        (membership) =>
          membership.societyId === societyId &&
          membership.role === "SOCIETY_ADMIN" &&
          membership.status === "ACTIVE",
      );
    residentUnitId =
      me.memberships.find(
        (membership) =>
          membership.societyId === societyId &&
          membership.role === "RESIDENT_USER" &&
          membership.status === "ACTIVE",
      )?.primaryUnitId ?? null;
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="space-y-6">
      <BackLink href={`/societies/${societyId}/visitors`} labelKey="nav.visitors" />
        <VisitorDetailView
            societyId={societyId}
            visitorId={visitorId}
            canManage={canManage}
            currentUserId={currentUserId}
            residentUnitId={residentUnitId}
          />
    </div>
  );
}
