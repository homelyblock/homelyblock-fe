import { redirect } from "next/navigation";
import {
  directoryAccessRedirect,
  loadCurrentSession,
} from "@/features/shell/access";
import { MembersPanel } from "@/features/society-structure/components/members-panel";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function SocietyMembersPage({ params }: PageProps) {
  const { societyId } = await params;
  const { me } = await loadCurrentSession();
  const destination = directoryAccessRedirect(me, societyId);
  if (destination) redirect(destination);

  return (
    <div className="space-y-6">
      <MembersPanel societyId={societyId} canManage />
    </div>
  );
}
