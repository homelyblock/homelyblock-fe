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
    "Keep residents, homes, maintenance bills, visitors, complaints, and notices together. People see only the societies their role allows.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "HomelyBlock — Your Society. Better Managed.",
    description:
      "Keep residents, homes, maintenance bills, visitors, complaints, and notices together. People see only the societies their role allows.",
    locale: "en_IN",
    type: "website",
  },
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
