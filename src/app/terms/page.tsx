import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { TermsBody } from "@/features/marketing/terms-body";

export const metadata = publicPageMetadata({
  title: "Terms and conditions",
  description: "The rules for society administrators, residents, and the platform owner when using HomelyBlock.",
  path: "/terms",
});

export const instant = false;

export default function TermsPage() {
  return (
    <PublicPage title="Terms and conditions" description="The rules for using the HomelyBlock application.">
      <TermsBody />
    </PublicPage>
  );
}
