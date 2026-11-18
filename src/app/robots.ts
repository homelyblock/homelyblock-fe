import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/features/marketing/public-metadata";

export default function robots(): MetadataRoute.Robots {
  const site = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/societies",
        "/profile",
        "/onboarding",
        "/admin",
        "/auth",
        "/password-reset",
        "/session-expired",
        "/unavailable",
        "/forbidden",
      ],
    },
    sitemap: site ? new URL("/sitemap.xml", site).toString() : "/sitemap.xml",
    host: site?.origin,
  };
}
