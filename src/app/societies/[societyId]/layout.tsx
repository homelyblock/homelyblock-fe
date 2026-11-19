import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SocietySidebar } from "@/components/layout/society-sidebar";
import {
  canManageSociety,
  canViewSociety,
  hasActiveSocietyMembership,
  loadCurrentSession,
} from "@/features/shell/access";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { fetchSociety } from "@/features/societies/api";

export const instant = false;

type SocietyLayoutProps = {
  children: ReactNode;
  params: Promise<{ societyId: string }>;
};

export default async function SocietyLayout({
  children,
  params,
}: SocietyLayoutProps) {
  const { societyId } = await params;
  const { token, me } = await loadCurrentSession();

  if (!canViewSociety(me, societyId)) {
    redirect("/forbidden");
  }

  let societyName = "Society";
  try {
    const society = await fetchSociety(token, societyId);
    societyName = society.name;
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="flex w-full flex-col md:min-h-[calc(100vh-3.5rem)] md:flex-row">
      <SocietySidebar
        societyId={societyId}
        societyName={societyName}
        canManage={canManageSociety(me, societyId)}
        includeHousehold={hasActiveSocietyMembership(me, societyId)}
        userLabel={me.displayName || me.email || "Account"}
        signOutReturnTo={
          me.platformRole === "PLATFORM_OWNER" ? "/admin/sign-in" : "/sign-in"
        }
      />
      <div className="motion-rise min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
