import type { ReactNode } from "react";
import { MarketingFrame } from "@/features/marketing/site-frame";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";

export const instant = false;

export async function PublicPage({
  title,
  description,
  children,
  layout = "article",
}: {
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
  layout?: "article" | "wide";
}) {
  const signedIn = Boolean(
    getSupabasePublicConfig() && (await getServerAccessToken()),
  );

  return (
    <MarketingFrame signedIn={signedIn}>
      {layout === "wide" ? (
        <div className="mx-auto w-full max-w-5xl px-4 py-14 sm:px-6">
          <header className="max-w-2xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
          </header>
          <div className="mt-10">{children}</div>
        </div>
      ) : (
        <article className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
          </header>
          <div className="mt-8 space-y-4 text-[15px] leading-7 break-words text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight">
            {children}
          </div>
        </article>
      )}
    </MarketingFrame>
  );
}
