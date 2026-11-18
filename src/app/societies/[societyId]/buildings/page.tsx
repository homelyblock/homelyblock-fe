import { redirect } from "next/navigation";
import {
  directoryAccessRedirect,
  loadCurrentSession,
} from "@/features/shell/access";
import { BuildingsPanel } from "@/features/society-structure/components/buildings-panel";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function SocietyBuildingsPage({ params }: PageProps) {
  const { societyId } = await params;
  const { me } = await loadCurrentSession();
  const destination = directoryAccessRedirect(me, societyId);
  if (destination) redirect(destination);

  return (
    <div className="space-y-6">
      <BuildingsPanel societyId={societyId} canManage />
    </div>
  );
}
