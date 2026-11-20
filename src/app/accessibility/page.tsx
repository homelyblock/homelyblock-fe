import { AccessibilityBody } from "@/features/marketing/accessibility-body";
import { localizedPublicMetadata } from "@/features/marketing/localized-metadata";
import { PublicPage } from "@/features/marketing/public-page";
import { Tx } from "@/i18n/tx";

export async function generateMetadata() {
  return localizedPublicMetadata("legalPages.accessTitle", "legalPages.accessLead", "/accessibility");
}

export const instant = false;

export default function AccessibilityPage() {
  return (
    <PublicPage title={<Tx k="legalPages.accessTitle" />} description={<Tx k="legalPages.accessLead" />}>
      <AccessibilityBody />
    </PublicPage>
  );
}
