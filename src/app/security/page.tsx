import Link from "next/link";
import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { LegalReviewNotice, OperatorBlock, PolicySection } from "@/features/marketing/legal-notice";

export const metadata = publicPageMetadata({
  title: "Security",
  description: "The security controls HomelyBlock implements, and how to report a vulnerability.",
  path: "/security",
});

export const instant = false;

export default function SecurityPage() {
  return (
    <PublicPage title="Security" description="What the product enforces, and what it does not claim.">
      <PolicySection>
        <LegalReviewNotice />
        <h2>Controls in the product</h2>
        <ul>
          <li>Sign-in is handled by the configured authentication service. HomelyBlock stores the account profile, not the password.</li>
          <li>API requests require a verified access token. The browser session cookie is not treated as enough for the API.</li>
          <li>Roles are read on the server. Public sign-up cannot create a platform owner, and a user cannot change their own privileged role.</li>
          <li>Society queries are limited to the caller’s active membership, or to platform-owner authority where the API allows it.</li>
          <li>New memberships start as invited and do not authorize access until they are activated.</li>
          <li>Requests are rate-limited. The contact form has a stricter limit.</li>
          <li>Security headers are set on the site and the API. Errors returned to browsers do not include stack traces in production.</li>
          <li>Selected administrative changes are written to an audit log. The log does not store passwords, tokens, or full payment credentials. It is not a complete login history.</li>
          <li>Complaint files are disabled by default. When storage is enabled, downloads still require an authorized request.</li>
        </ul>
        <h2>What is not in the product</h2>
        <p>
          There is no multi-factor step in the application for the platform owner. The sign-in service may offer that separately, but HomelyBlock does not require it. There is no security certification to display. Backups, clock synchronisation, and 180-day log retention inside India are operator infrastructure duties, not switches in this repository.
        </p>
        <h2>Report a vulnerability</h2>
        <OperatorBlock />
        <p>
          Send a report through the <Link href="/contact">contact form</Link> with the subject “Security report”. Describe the impact and the page or API involved. Do not include a working exploit, other people’s data, or a demand for payment. Give the operator a reasonable time to respond before any public write-up. This is a reporting channel, not a promise of a bounty.
        </p>
        <h2>CERT-In</h2>
        <p>
          If the operating entity is a service provider, intermediary, data centre, body corporate, or government organisation, the CERT-In directions of 28 April 2022 can require a six-hour report of specified incidents, 180-day ICT logs kept in India, NIC or NPL time synchronisation, and a designated point of contact. The point of contact is not configured in the product. A cloud vendor’s compliance does not replace the operator’s own duty. Whether this deployment is in scope has to be confirmed once the legal entity is known.
        </p>
      </PolicySection>
    </PublicPage>
  );
}
