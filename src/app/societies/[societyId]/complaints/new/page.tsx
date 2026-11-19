import { BackLink } from "@/components/layout/back-link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { ComplaintForm } from "@/features/complaints/components/complaint-form";
import { fetchMe } from "@/features/societies/api";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function NewComplaintPage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  const { societyId } = await params;
  try {
    const me = await fetchMe(token);
    const isResident = me.memberships.some(
      (membership) =>
        membership.societyId === societyId &&
        membership.role === "RESIDENT_USER" &&
        membership.status === "ACTIVE",
    );
    if (!isResident) redirect(`/societies/${societyId}/complaints`);
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="space-y-6">
      <BackLink href={`/societies/${societyId}/complaints`} labelKey="nav.complaints" />
        <ComplaintForm societyId={societyId} />
    </div>
  );
}
