import { redirect } from "next/navigation";
import {
  directoryAccessRedirect,
  loadCurrentSession,
} from "@/features/shell/access";
import { ResidentsDirectory } from "@/features/households/components/residents-directory";

type PageProps = {
  params: Promise<{ societyId: string }>;
};

export const instant = false;

export default async function SocietyResidentsPage({ params }: PageProps) {
  const { societyId } = await params;
  const { me } = await loadCurrentSession();
  const destination = directoryAccessRedirect(me, societyId);
  if (destination) redirect(destination);

  return (
    <div className="space-y-6">
      <ResidentsDirectory societyId={societyId} />
    </div>
  );
}
