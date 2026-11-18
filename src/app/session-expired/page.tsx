import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";
import { safeAuthRedirectPath } from "@/features/auth/safe-redirect";

export const instant = false;

type SessionExpiredPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SessionExpiredPage({
  searchParams,
}: SessionExpiredPageProps) {
  const params = await searchParams;
  const next = safeAuthRedirectPath(params.next, "/societies");

  return (
    <StatusPage
      code="Session"
      title="Your session has expired"
      description="Sign in again to continue. You will return to the page you were using when your session ended."
    >
      <Link
        href={`/sign-in?next=${encodeURIComponent(next)}`}
        className={buttonVariants()}
      >
        Sign in again
      </Link>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to home
      </Link>
    </StatusPage>
  );
}
