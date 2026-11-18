import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { fetchMe } from "@/features/societies/api";
import { WalkInVisitorForm } from "@/features/visitors/components/walk-in-visitor-form";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function WalkInVisitorPage({ params }: PageProps) {
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
    if (!canManage) {
      redirect(`/societies/${societyId}/visitors`);
    }
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
          <Link
            href={`/societies/${societyId}/visitors`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to visitors
          </Link>
        </p>
        <WalkInVisitorForm societyId={societyId} />
    </div>
  );
}
