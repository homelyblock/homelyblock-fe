import { PublicPage } from "@/features/marketing/public-page";
import { localizedPublicMetadata } from "@/features/marketing/localized-metadata";
import { PrivacyPolicyBody } from "@/features/marketing/privacy-body";
import { Tx } from "@/i18n/tx";

export async function generateMetadata() {
  return localizedPublicMetadata(
    "legalPages.privacyTitle",
    "legalPages.privacyLead",
    "/privacy-policy",
  );
}

export const instant = false;

export default function PrivacyPolicyPage() {
  return (
    <PublicPage title={<Tx k="legalPages.privacyTitle" />} description={<Tx k="legalPages.privacyLead" />}>
      <PrivacyPolicyBody />
    </PublicPage>
  );
}
