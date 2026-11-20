import { CookiesBody } from "@/features/marketing/cookies-body";
import { localizedPublicMetadata } from "@/features/marketing/localized-metadata";
import { PublicPage } from "@/features/marketing/public-page";
import { Tx } from "@/i18n/tx";

export async function generateMetadata() {
  return localizedPublicMetadata("legalPages.cookiesTitle", "legalPages.cookiesLead", "/cookies");
}

export const instant = false;

export default function CookiesPage() {
  return (
    <PublicPage title={<Tx k="legalPages.cookiesTitle" />} description={<Tx k="legalPages.cookiesLead" />}>
      <CookiesBody />
    </PublicPage>
  );
}
