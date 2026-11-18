import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/features/marketing/public-metadata";

const paths = [
  "/",
  "/about",
  "/features",
  "/how-it-works",
  "/contact",
  "/faq",
  "/help",
  "/security",
  "/privacy-policy",
  "/terms",
  "/cookies",
  "/acceptable-use",
  "/accessibility",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteUrl();
  return paths.map((path) => ({
    url: site ? new URL(path, site).toString() : path,
    lastModified: "2026-11-18",
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));
}
