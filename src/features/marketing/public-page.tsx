import type { ReactNode } from "react";
import { MarketingFrame } from "@/features/marketing/site-frame";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";

export const instant = false;

export async function PublicPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const signedIn = Boolean(
    getSupabasePublicConfig() && (await getServerAccessToken()),
  );

  return (
    <MarketingFrame signedIn={signedIn}>
      <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
          <div className="mt-8 space-y-4 text-sm leading-7 break-words text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight">
            {children}
          </div>
        </div>
      </article>
    </MarketingFrame>
  );
}
