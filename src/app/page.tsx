import type { Metadata } from "next";
import { LandingContent } from "@/features/marketing/landing-content";
import { MarketingFrame } from "@/features/marketing/site-frame";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import { getServerAccessToken } from "@/features/auth/server-session";

export const metadata: Metadata = {
  title: {
    absolute: "HomelyBlock — Your Society. Better Managed.",
  },
  description:
    "Manage residents, maintenance, visitors, complaints and everyday society operations in one simple platform.",
  alternates: { canonical: "/" },
};

export const instant = false;

export default async function HomePage() {
  const signedIn = Boolean(
    getSupabasePublicConfig() && (await getServerAccessToken()),
  );

  return (
    <MarketingFrame signedIn={signedIn}>
      <LandingContent signedIn={signedIn} />
    </MarketingFrame>
  );
}
