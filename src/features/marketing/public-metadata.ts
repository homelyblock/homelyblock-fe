import type { Metadata } from "next";

export function getSiteUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    return new URL(`${url.origin}/`);
  } catch {
    return null;
  }
}

export function publicPageMetadata(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const site = getSiteUrl();
  const canonical = site ? new URL(input.path, site).toString() : input.path;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical },
    openGraph: {
      title: `${input.title} — LivingSpace`,
      description: input.description,
      url: canonical,
      siteName: "LivingSpace",
      locale: "en_IN",
      type: "website",
    },
  };
}

export const privateRobots: Metadata = {
  robots: { index: false, follow: false },
};
