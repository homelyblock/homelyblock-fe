import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { OpenCookiePreferences } from "@/features/marketing/cookie-consent";
import { LegalReviewNotice, PolicySection } from "@/features/marketing/legal-notice";

export const metadata = publicPageMetadata({
  title: "Cookie policy",
  description: "LivingSpace uses essential sign-in cookies and does not use analytics or marketing cookies.",
  path: "/cookies",
});

export const instant = false;

export default function CookiesPage() {
  return (
    <PublicPage title="Cookie policy" description="What is stored in the browser, and what is not.">
      <PolicySection>
        <LegalReviewNotice />
        <h2>Essential cookies</h2>
        <p>
          The sign-in service sets cookies that keep the session. They are required to stay signed in. They are not optional, and rejecting non-essential cookies does not remove them. Signing out ends the session.
        </p>
        <h2>Other categories</h2>
        <p>
          Functional, analytics, and marketing cookies are not used. The product does not load an analytics or advertising script. The preference control records your choice and keeps those categories off. Accept all does not enable tracking, because there is no tracking to enable.
        </p>
        <p>
          A first-party preference cookie, <span className="font-medium">ls_cookie_preferences</span>, stores that choice for about 180 days. It is not an authentication cookie.
        </p>
        <h2>Change your choice</h2>
        <p>
          <OpenCookiePreferences className="font-medium underline-offset-4 hover:underline">
            Open cookie preferences
          </OpenCookiePreferences>
        </p>
        <p>
          This is an accurate disclosure of the current application. It is not a claim that the GDPR applies. Indian privacy duties are described in the privacy policy, including which parts of the Digital Personal Data Protection Act, 2023 are not yet in force.
        </p>
      </PolicySection>
    </PublicPage>
  );
}
