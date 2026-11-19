import { BackLink } from "@/components/layout/back-link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { ComplaintDetailView } from "@/features/complaints/components/complaint-detail";
import { fetchMe } from "@/features/societies/api";

type PageProps = {
  params: Promise<{ societyId: string; complaintId: string }>;
};

export const instant = false;

export default async function ComplaintDetailPage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  const { societyId, complaintId } = await params;
  let canManage = false;
  let currentUserId = "";
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
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="space-y-6">
      <BackLink href={`/societies/${societyId}/complaints`} labelKey="nav.complaints" />
        <ComplaintDetailView
            societyId={societyId}
            complaintId={complaintId}
            canManage={canManage}
            currentUserId={currentUserId}
          />
    </div>
  );
}
