import { BackLink } from "@/components/layout/back-link";
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
      <BackLink href={`/societies/${societyId}/household`} labelKey="nav.household" />
      <HouseholdMemberEdit societyId={societyId} memberId={memberId} />
    </div>
  );
}
