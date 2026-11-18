import Link from "next/link";
import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";

export const metadata = publicPageMetadata({
  title: "About",
  description: "HomelyBlock is a web application for residents and administrators of a residential society.",
  path: "/about",
});

export const instant = false;

export default function AboutPage() {
  return (
    <PublicPage title="About HomelyBlock" description="One practical system for the records a society already keeps.">
      <p>
        HomelyBlock is built for apartment residents, society administrators, and the platform owner who provisions societies. It keeps homes, people, notices, visitors, maintenance records, complaints, and local services in one web application.
      </p>
      <p>
        It does not replace a bank, a security gate, or a messaging app. It does not take maintenance payments online. A person sees only the societies and records their role allows.
      </p>
      <p>
        The operating organisation’s registered name is shown in the footer when it has been configured. Until then, the product does not claim a company identity. Read the <Link href="/features">features</Link> and <Link href="/how-it-works">how it works</Link> pages for what you can do today.
      </p>
    </PublicPage>
  );
}
