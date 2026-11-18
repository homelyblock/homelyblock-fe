import { redirect } from "next/navigation";
import { homePathForAccount } from "@/features/auth/account-routing";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { loadCurrentSession } from "@/features/shell/access";
import { StatusBadge } from "@/components/ui/badge";

export const instant = false;

export default async function OnboardingPendingPage() {
  const { me } = await loadCurrentSession();
  const home = homePathForAccount(me);
  if (home !== "/onboarding/pending") {
    redirect(home);
  }

  const waiting = me.memberships.filter((membership) =>
    membership.status === "INVITED" ||
    membership.status === "SUSPENDED" ||
    membership.status === "REMOVED",
  );

  return (
    <div className="mx-auto w-full max-w-xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Waiting for access
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Signing in does not open a society. A society administrator has to
          activate your membership first. This page does not show other
          residents or society directories.
        </p>
      </div>

      {waiting.length === 0 ? (
        <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
          You do not have a society membership yet. Registering as a resident
          does not attach you to a society. Ask a society administrator to
          invite the account you used to sign in.
        </p>
      ) : (
        <ul className="space-y-3">
          {waiting.map((membership) => {
            const societyName = membership.society?.name ?? "A society";
            const message =
              membership.status === "INVITED"
                ? "You are invited. Notices, visitors, bills, and complaints stay unavailable until an administrator activates this membership."
                : membership.status === "SUSPENDED"
                  ? "Your access is suspended. The society stays unavailable until an administrator activates this membership again."
                  : "This membership was removed. You cannot open the society unless an administrator invites you again.";
            return (
              <li
                key={membership.id}
                className="space-y-2 rounded-lg border border-border bg-card px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {societyName}
                  </p>
                  <StatusBadge value={membership.status} />
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {message}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <SignOutButton />
    </div>
  );
}
