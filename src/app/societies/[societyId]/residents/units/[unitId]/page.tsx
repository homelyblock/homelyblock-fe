import { BackLink } from "@/components/layout/back-link";
import { redirect } from "next/navigation";
import {
  directoryAccessRedirect,
  loadCurrentSession,
} from "@/features/shell/access";
import { UnitOccupancy } from "@/features/households/components/unit-occupancy";

type PageProps = {
  params: Promise<{ societyId: string; unitId: string }>;
};

export const instant = false;

export default async function UnitOccupancyPage({ params }: PageProps) {
  const { societyId, unitId } = await params;
  const { me } = await loadCurrentSession();
  const destination = directoryAccessRedirect(me, societyId);
  if (destination) redirect(destination);

  return (
    <div className="space-y-6">
      <BackLink href={`/societies/${societyId}/residents`} labelKey="nav.residents" />
      <UnitOccupancy societyId={societyId} unitId={unitId} />
    </div>
  );
}
