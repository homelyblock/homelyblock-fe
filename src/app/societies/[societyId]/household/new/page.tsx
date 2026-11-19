import { BackLink } from "@/components/layout/back-link";
import { redirect } from "next/navigation";
import { HouseholdMemberForm } from "@/features/households/components/household-member-form";
import {
  hasActiveSocietyMembership,
  loadCurrentSession,
} from "@/features/shell/access";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function NewHouseholdMemberPage({ params }: PageProps) {
  const { societyId } = await params;
  const { me } = await loadCurrentSession();
  if (!hasActiveSocietyMembership(me, societyId)) {
    redirect(`/societies/${societyId}`);
  }

  return (
    <div className="space-y-6">
      <BackLink href={`/societies/${societyId}/household`} labelKey="nav.household" />
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Add household member
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add someone who shares your unit. No login account is created.
          </p>
        </div>
        <HouseholdMemberForm societyId={societyId} />
      </div>
    </div>
  );
}
