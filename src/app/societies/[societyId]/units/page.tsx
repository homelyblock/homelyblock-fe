import { redirect } from "next/navigation";
import {
  directoryAccessRedirect,
  loadCurrentSession,
} from "@/features/shell/access";
import { UnitsPanel } from "@/features/society-structure/components/units-panel";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function SocietyUnitsPage({ params }: PageProps) {
  const { societyId } = await params;
  const { me } = await loadCurrentSession();
  const destination = directoryAccessRedirect(me, societyId);
  if (destination) redirect(destination);

  return (
    <div className="space-y-6">
      <UnitsPanel societyId={societyId} canManage />
    </div>
  );
}
