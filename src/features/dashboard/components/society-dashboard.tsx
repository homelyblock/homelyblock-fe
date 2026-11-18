"use client";

import { SocietyDetailView } from "@/features/societies/components/society-detail";
import { AdminDashboardPanel } from "./admin-dashboard";
import { ResidentDashboardPanel } from "./resident-dashboard";

type SocietyDashboardProps = {
  societyId: string;
  mode: "admin" | "resident" | "profile";
  canEditProfile: boolean;
};

export function SocietyDashboard({
  societyId,
  mode,
  canEditProfile,
}: SocietyDashboardProps) {
  if (mode === "admin") {
    return (
      <div className="space-y-10">
        <AdminDashboardPanel societyId={societyId} />
        <details className="rounded-lg border border-border bg-card px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-foreground">
            Society profile settings
          </summary>
          <div className="mt-4">
            <SocietyDetailView societyId={societyId} canEdit={canEditProfile} />
          </div>
        </details>
      </div>
    );
  }

  if (mode === "resident") {
    return <ResidentDashboardPanel societyId={societyId} />;
  }

  return <SocietyDetailView societyId={societyId} canEdit={canEditProfile} />;
}
