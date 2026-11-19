import Link from "next/link";
import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";

export const metadata = publicPageMetadata({
  title: "How it works",
  description: "How a society administrator sets up HomelyBlock and how a resident is connected.",
  path: "/how-it-works",
});

export const instant = false;

export default function HowItWorksPage() {
  return (
    <PublicPage layout="wide" title="How it works" description="Five steps, with the checks the product actually applies.">
      <ol className="grid gap-4 md:grid-cols-2">
        {[
          "A society administrator creates an account on the sign-up page and confirms the email sent by the sign-in service. The platform owner account is not created here.",
          "The administrator configures the society during onboarding, or a platform owner creates the society and assigns an administrator.",
          "The administrator adds buildings and units.",
          "A resident creates their own login. An administrator then connects that existing account. The membership starts as invited and does not reveal society records until it is activated. HomelyBlock does not email an invitation link.",
          "The society uses notices, visitors, bills, complaints, the household list, and the services directory. Each request is checked against the caller’s role and society.",
        ].map((step, index) => (
          <li key={step} className="rounded-xl border border-border bg-card p-5 text-sm leading-6">
            <span className="text-xs font-semibold tracking-wide text-primary uppercase">Step {index + 1}</span>
            <p className="mt-2">{step}</p>
          </li>
        ))}
      </ol>
      <p className="mt-6 max-w-3xl text-sm leading-6 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
        A person can hold memberships in more than one society. Opening one society does not open another. Read the <Link href="/faq">FAQ</Link> for membership and billing questions.
      </p>
    </PublicPage>
  );
}
