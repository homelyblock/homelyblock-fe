import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { ComplaintsOverview } from "@/features/complaints/components/complaints-overview";
import { fetchMe } from "@/features/societies/api";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function SocietyComplaintsPage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  const { societyId } = await params;
  let canManage = false;
  try {
    const me = await fetchMe(token);
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
      <ComplaintsOverview societyId={societyId} canManage={canManage} />
    </div>
  );
}
