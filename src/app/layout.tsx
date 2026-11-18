import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/components/providers";
import { CookieConsent } from "@/features/marketing/cookie-consent";
import { getSiteUrl } from "@/features/marketing/public-metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: siteUrl } : {}),
  title: "HomelyBlock",
  description:
    "Manage residents, maintenance, visitors, complaints and everyday society operations in one simple platform.",
  openGraph: {
    title: "HomelyBlock",
    description:
      "Manage residents, maintenance, visitors, complaints and everyday society operations in one simple platform.",
    siteName: "HomelyBlock",
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <AppProviders>{children}</AppProviders>
        <CookieConsent />
      </body>
    </html>
  );
}
