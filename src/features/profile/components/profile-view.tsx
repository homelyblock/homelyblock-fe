"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/format-date";
import { formatIndianPhone } from "@/lib/indian-phone";
import { StatusBadge } from "@/components/ui/badge";
import { useI18n } from "@/i18n/provider";
import type { Profile } from "../types";

type ProfileViewProps = {
  profile: Profile;
};

export function ProfileView({ profile }: ProfileViewProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("work.profileTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("work.profileHelp")}</p>
        </div>
        <Link href="/profile/edit" className={buttonVariants()}>
          {t("work.editProfile")}
        </Link>
      </div>

      <dl className="space-y-3 rounded-lg border border-border bg-card px-4 py-4 text-sm">
        <div>
          <dt className="text-muted-foreground">{t("profile.displayName")}</dt>
          <dd className="mt-0.5 font-medium text-foreground">
            {profile.displayName}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Email</dt>
          <dd className="mt-0.5 text-foreground">{profile.email ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="mt-0.5 text-foreground">{formatIndianPhone(profile.phone)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">{t("work.memberSince")}</dt>
          <dd className="mt-0.5 text-foreground">
            {formatDate(profile.createdAt)}
          </dd>
        </div>
      </dl>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{t("work.societies")}</h2>
        {profile.memberships.length === 0 ? (
          <p className="rounded-lg border border-dashed border-input bg-card px-4 py-6 text-sm text-muted-foreground">
            You are not a member of any society yet. An administrator must invite this account before you can open a society.
          </p>
        ) : (
          <ul className="space-y-2">
            {profile.memberships.map((membership) => {
              const active = membership.status === "ACTIVE";
              const body = (
                <>
                  <p className="text-sm font-medium text-foreground">
                    {membership.society.name}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <StatusBadge value={membership.role} />
                    <StatusBadge value={membership.status} />
                    {membership.primaryUnitId ? <span>{t("work.primaryUnitAssigned")}</span> : null}
                  </p>
                  {active ? null : (
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {membership.status === "INVITED"
                        ? "Invited. Access starts only after an administrator activates this membership."
                        : membership.status === "SUSPENDED"
                          ? "Suspended. This society is unavailable until an administrator restores access."
                          : "This membership does not grant access to the society."}
                    </p>
                  )}
                </>
              );
              return (
                <li key={membership.id}>
                  {active ? (
                    <Link
                      href={`/societies/${membership.societyId}`}
                      className="block rounded-lg border border-border bg-card px-4 py-3 hover:bg-muted/60"
                    >
                      {body}
                    </Link>
                  ) : (
                    <div className="rounded-lg border border-border bg-card px-4 py-3">
                      {body}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="text-sm leading-6 text-muted-foreground">
        This screen cannot delete an account or change a society role. A society administrator can suspend or remove a membership. Closing the login itself is handled by the organization that operates this deployment.
      </p>
    </div>
  );
}
