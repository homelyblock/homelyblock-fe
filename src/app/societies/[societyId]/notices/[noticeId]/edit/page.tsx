import Link from "next/link";
import { redirect } from "next/navigation";
import { redirectForLoadFailure } from "@/features/shell/navigation";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";
import { fetchNotice } from "@/features/notices/api";
import { NoticeForm } from "@/features/notices/components/notice-form";
import { fetchMe } from "@/features/societies/api";

type PageProps = {
  params: Promise<{ societyId: string; noticeId: string }>;
};

export const instant = false;

export default async function EditNoticePage({ params }: PageProps) {
  if (!getSupabasePublicConfig()) {
    redirect("/sign-in");
  }

  const token = await getServerAccessToken();
  if (!token) {
    redirect("/sign-in");
  }

  const { societyId, noticeId } = await params;

  let canManage = false;
  let notice;
  try {
    const me = await fetchMe(token);
    canManage =
      me.platformRole === "PLATFORM_OWNER" ||
      me.memberships.some(
        (membership) =>
          membership.societyId === societyId &&
          membership.role === "SOCIETY_ADMIN" &&
          membership.status === "ACTIVE",
      );
    if (!canManage) {
      redirect(`/societies/${societyId}/notices/${noticeId}`);
    }
    notice = await fetchNotice(token, noticeId);
    if (notice.status !== "DRAFT") {
      redirect(`/societies/${societyId}/notices/${noticeId}`);
    }
  } catch (error) {
    redirectForLoadFailure(error);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
          <Link
            href={`/societies/${societyId}/notices/${noticeId}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to notice
          </Link>
        </p>
        <NoticeForm societyId={societyId} notice={notice} />
    </div>
  );
}
