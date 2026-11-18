import { redirect } from "next/navigation";
import { HouseholdList } from "@/features/households/components/household-list";
import {
  hasActiveSocietyMembership,
  loadCurrentSession,
} from "@/features/shell/access";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function SocietyHouseholdPage({ params }: PageProps) {
  const { societyId } = await params;
  const { me } = await loadCurrentSession();
  if (!hasActiveSocietyMembership(me, societyId)) {
    redirect(`/societies/${societyId}`);
  }

  return (
    <div className="space-y-6">
      <HouseholdList societyId={societyId} />
    </div>
  );
}
