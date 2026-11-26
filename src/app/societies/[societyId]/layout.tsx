import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SocietyBottomTabs } from "@/components/layout/society-bottom-tabs";
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

  const canManage = canManageSociety(me, societyId);
  const includeHousehold = hasActiveSocietyMembership(me, societyId);

  return (
    <>
      <div className="flex w-full flex-col md:min-h-[calc(100vh-3.5rem)] md:flex-row">
        {/* Desktop / website: persistent sidebar. Phone / PWA: bottom tabs + More sheet. */}
        <SocietySidebar
          societyId={societyId}
          societyName={societyName}
          canManage={canManage}
          includeHousehold={includeHousehold}
          userLabel={me.displayName || me.email || "Account"}
          signOutReturnTo={
            me.platformRole === "PLATFORM_OWNER" ? "/admin/sign-in" : "/sign-in"
          }
        />
        <div className="motion-rise min-w-0 flex-1 px-4 py-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] sm:px-6 md:pb-6 lg:px-10">
          <div className="w-full">{children}</div>
        </div>
      </div>
      <SocietyBottomTabs
        societyId={societyId}
        canManage={canManage}
        includeHousehold={includeHousehold}
      />
    </>
  );
}
