import Link from "next/link";
import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";

export const metadata = publicPageMetadata({
  title: "How it works",
  description: "How a society administrator sets up LivingSpace and how a resident is connected.",
  path: "/how-it-works",
});

export const instant = false;

export default function HowItWorksPage() {
  return (
    <PublicPage title="How it works" description="Five steps, with the checks the product actually applies.">
      <ol className="list-decimal space-y-3 pl-5">
        <li>A society administrator creates an account on the sign-up page and confirms the email sent by the sign-in service. The platform owner account is not created here.</li>
        <li>The administrator configures the society during onboarding, or a platform owner creates the society and assigns an administrator.</li>
        <li>The administrator adds buildings and units.</li>
        <li>A resident creates their own login. An administrator then connects that existing account. The membership starts as invited and does not reveal society records until it is activated. LivingSpace does not email an invitation link.</li>
        <li>The society uses notices, visitors, bills, complaints, the household list, and the services directory. Each request is checked against the caller’s role and society.</li>
      </ol>
      <p>
        A person can hold memberships in more than one society. Opening one society does not open another. Read the <Link href="/faq">FAQ</Link> for membership and billing questions.
      </p>
    </PublicPage>
  );
}
