import { localizedPublicMetadata } from "@/features/marketing/localized-metadata";
import { PublicPage } from "@/features/marketing/public-page";
import { TermsBody } from "@/features/marketing/terms-body";
import { Tx } from "@/i18n/tx";

export async function generateMetadata() {
  return localizedPublicMetadata("legalPages.termsTitle", "legalPages.termsLead", "/terms");
}

export const instant = false;

export default function TermsPage() {
  return (
    <PublicPage title={<Tx k="legalPages.termsTitle" />} description={<Tx k="legalPages.termsLead" />}>
      <TermsBody />
    </PublicPage>
  );
}
