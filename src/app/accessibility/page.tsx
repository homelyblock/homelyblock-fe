import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { LegalReviewNotice, PolicySection } from "@/features/marketing/legal-notice";

export const metadata = publicPageMetadata({
  title: "Accessibility",
  description: "How HomelyBlock approaches accessibility, and what has not been formally audited.",
  path: "/accessibility",
});

export const instant = false;

export default function AccessibilityPage() {
  return (
    <PublicPage title="Accessibility" description="The target is WCAG 2.2 AA where the product can meet it. This is not a completed audit.">
      <PolicySection>
        <LegalReviewNotice />
        <h2>What the interface includes</h2>
        <ul>
          <li>Pages use one main heading and section headings in order.</li>
          <li>Forms have visible labels. Errors are written next to the field.</li>
          <li>A skip link is the first control on the page.</li>
          <li>Focus is visible on links, buttons, and form fields.</li>
          <li>The society menu can be used from the keyboard.</li>
          <li>Text is deep forest on a warm background so it stays readable. Sage is not used as the body colour.</li>
        </ul>
        <h2>What is not claimed</h2>
        <p>
          There has not been a formal WCAG audit or a certification. Some data tables scroll on a narrow screen. If a page blocks you, use the contact form and name the page and the assistive technology. The Rights of Persons with Disabilities Act, 2016 may be relevant to the operating organisation. This statement does not decide that legal question.
        </p>
      </PolicySection>
    </PublicPage>
  );
}
