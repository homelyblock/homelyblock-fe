import Link from "next/link";
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
      <p className="text-sm text-muted-foreground">
        <Link
          href={`/societies/${societyId}/household`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          ← Back to household
        </Link>
      </p>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
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
