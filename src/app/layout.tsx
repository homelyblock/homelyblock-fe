import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import { AppProviders } from "@/components/providers";
import { ThemeSync } from "@/components/theme/theme-sync";
import { CookieConsent } from "@/features/marketing/cookie-consent";
import { getSiteUrl } from "@/features/marketing/public-metadata";
import { isLocale, type Locale } from "@/i18n/types";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const stored = (await cookies()).get("hb-locale")?.value;
  const locale: Locale = isLocale(stored) ? stored : "en";
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("hb-theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark")}catch(e){}})();`,
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow"
        >
          Skip to content
        </a>
        <ThemeSync />
        <AppProviders initialLocale={locale}>
          {children}
          <CookieConsent />
        </AppProviders>
      </body>
    </html>
  );
}
