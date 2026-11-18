import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { BillDetailView } from "@/features/billing/components/bill-detail";
import { fetchMe } from "@/features/societies/api";

type PageProps = {
  params: Promise<{ societyId: string; billId: string }>;
};

export const instant = false;

export default async function SocietyBillDetailPage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) redirect("/sign-in");
  const token = await getServerAccessToken();
  if (!token) redirect("/sign-in");

  const { societyId, billId } = await params;
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
            href={`/societies/${societyId}/billing`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to billing
          </Link>
        </p>
        <BillDetailView
            societyId={societyId}
            billId={billId}
            canManage={canManage}
          />
    </div>
  );
}
