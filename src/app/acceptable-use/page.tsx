import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { LegalReviewNotice, PolicySection } from "@/features/marketing/legal-notice";

export const metadata = publicPageMetadata({
  title: "Acceptable use",
  description: "What you may and may not do with a LivingSpace account.",
  path: "/acceptable-use",
});

export const instant = false;

export default function AcceptableUsePage() {
  return (
    <PublicPage title="Acceptable use" description="Use LivingSpace for genuine society operations.">
      <PolicySection>
        <LegalReviewNotice />
        <h2>Expected use</h2>
        <p>
          Administrators use the product to run their society. Residents use it for their own home, notices, bills, visitors, and complaints. Enter information you are allowed to share.
        </p>
        <h2>Prohibited</h2>
        <ul>
          <li>Trying to open another society, another household, or another person’s private records.</li>
          <li>Granting yourself platform owner access, or presenting a public sign-up as that role.</li>
          <li>Uploading malware, or submitting a complaint attachment that is not a genuine image of the issue when storage is enabled.</li>
          <li>Sending bulk or misleading messages through the contact form.</li>
          <li>Recording a payment that did not happen, or reversing one to hide a collection.</li>
          <li>Scraping personal data from the product.</li>
          <li>Using the service to harass a resident or to publish a notice you know is false.</li>
        </ul>
        <p>
          The interface is not the security boundary. Misuse can lead to a suspended membership. Where the conduct is an offence, the operator may report it.
        </p>
      </PolicySection>
    </PublicPage>
  );
}
