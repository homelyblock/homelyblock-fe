import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { ServiceDetailView } from "@/features/services/components/service-detail";
import { fetchMe } from "@/features/societies/api";

type PageProps = {
  params: Promise<{ societyId: string; serviceId: string }>;
};

export const instant = false;

export default async function ServiceDetailPage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  const { societyId, serviceId } = await params;
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
      <p className="text-sm text-muted-foreground">
          <Link
            href={`/societies/${societyId}/services`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to services
          </Link>
        </p>
        <ServiceDetailView
            societyId={societyId}
            serviceId={serviceId}
            canManage={canManage}
          />
    </div>
  );
}
