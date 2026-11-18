import Link from "next/link";
import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";

export const metadata = publicPageMetadata({
  title: "Help Center",
  description: "Short guides for getting started, society administration, resident use, billing, and account security.",
  path: "/help",
});

export const instant = false;

export default function HelpPage() {
  return (
    <PublicPage title="Help Center" description="Guides for the features that exist. Society complaints are not platform tickets.">
      <h2>Getting started</h2>
      <p>
        Society administrators <Link href="/sign-up">create an account</Link>, confirm the email, and set up the society. Residents create a login and wait until an administrator activates their membership. The <Link href="/how-it-works">how it works</Link> page has the order of steps.
      </p>
      <h2>Administrator guides</h2>
      <p>
        After the society exists, add buildings and units, then connect existing user accounts. Publish notices when you are ready for residents to see them. Generate bills only after the maintenance configuration is set. Activate a membership before expecting the resident to see society data.
      </p>
      <h2>Resident guides</h2>
      <p>
        Open your societies, then the society that was activated for you. From there you can read notices, view bills, raise a complaint, register an expected visitor, update your household, and look up service contacts. If a society is missing, the membership is not active yet.
      </p>
      <h2>Account and security</h2>
      <p>
        Reset a password from the sign-in page. Sign out from the account menu. Platform owner sign-in is a separate entrance and is not linked from the public site. Report a product weakness from the <Link href="/security">security</Link> page.
      </p>
      <h2>Billing and payments</h2>
      <p>
        Bills are society records. Payments are entered by an administrator after the society has collected the money. LivingSpace does not take a card or UPI payment and does not email a receipt from a gateway. A recorded payment can be reversed by an authorized administrator.
      </p>
      <h2>Complaints and support</h2>
      <p>
        A complaint inside a society is for that society’s administrator. A question about the LivingSpace platform goes through the <Link href="/contact">contact form</Link>. The two are stored separately.
      </p>
    </PublicPage>
  );
}
