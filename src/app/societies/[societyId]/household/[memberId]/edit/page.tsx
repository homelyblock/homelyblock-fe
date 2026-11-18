import Link from "next/link";
import { redirect } from "next/navigation";
import { HouseholdMemberEdit } from "@/features/households/components/household-member-edit";
import {
  hasActiveSocietyMembership,
  loadCurrentSession,
} from "@/features/shell/access";

type PageProps = {
  params: Promise<{ societyId: string; memberId: string }>;
};

export const instant = false;

export default async function EditHouseholdMemberPage({ params }: PageProps) {
  const { societyId, memberId } = await params;
  const { me } = await loadCurrentSession();
  if (!hasActiveSocietyMembership(me, societyId)) {
    redirect(`/societies/${societyId}`);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        <Link
          href={`/societies/${societyId}/household`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          ← Back to household
        </Link>
      </p>
      <HouseholdMemberEdit societyId={societyId} memberId={memberId} />
    </div>
  );
}
