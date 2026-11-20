import { localizedPublicMetadata } from "@/features/marketing/localized-metadata";
import { PublicPage } from "@/features/marketing/public-page";
import { SecurityBody } from "@/features/marketing/security-body";
import { Tx } from "@/i18n/tx";

export async function generateMetadata() {
  return localizedPublicMetadata("legalPages.securityTitle", "legalPages.securityLead", "/security");
}

export const instant = false;

export default function SecurityPage() {
  return (
    <PublicPage title={<Tx k="legalPages.securityTitle" />} description={<Tx k="legalPages.securityLead" />}>
      <SecurityBody />
    </PublicPage>
  );
}
