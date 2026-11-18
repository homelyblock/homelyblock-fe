import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { fetchService } from "@/features/services/api";
import { ServiceForm } from "@/features/services/components/service-form";
import { fetchMe } from "@/features/societies/api";

type PageProps = {
  params: Promise<{ societyId: string; serviceId: string }>;
};

export const instant = false;

export default async function EditServicePage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  const { societyId, serviceId } = await params;
  let canManage = false;
  let service;
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
    if (!canManage) {
      redirect(`/societies/${societyId}/services/${serviceId}`);
    }
    service = await fetchService(token, serviceId);
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
          <Link
            href={`/societies/${societyId}/services/${serviceId}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to provider
          </Link>
        </p>
        <ServiceForm societyId={societyId} service={service} />
    </div>
  );
}
