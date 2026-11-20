import Link from "next/link";
import { cookies } from "next/headers";
import { buttonVariants } from "@/components/ui/button";
import { StatusPage } from "@/components/layout/status-views";
import {
  AUTH_ENTRY_COOKIE,
  authEntryFromCookie,
  signInPathForEntry,
} from "@/features/auth/account-routing";
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
  const jar = await cookies();
  const signInPath = signInPathForEntry(
    authEntryFromCookie(jar.get(AUTH_ENTRY_COOKIE)?.value),
  );

  return (
    <StatusPage
      code="Session"
      title="Your session has expired"
      description="Sign in again to continue. You will return to the page you were using when your session ended."
    >
      <Link
        href={`${signInPath}?next=${encodeURIComponent(next)}`}
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
