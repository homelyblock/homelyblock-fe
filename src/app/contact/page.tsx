import Link from "next/link";
import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { ContactForm } from "@/features/marketing/contact-form";

export const metadata = publicPageMetadata({
  title: "Contact",
  description: "Send a message about the LivingSpace platform. Society complaints stay with your society administrator.",
  path: "/contact",
});

export const instant = false;

export default function ContactPage() {
  return (
    <PublicPage
      title="Contact"
      description="Platform questions come here. A leaking pipe, a visitor, or a bill belongs with your society administrator."
    >
      <p>
        LivingSpace does not publish a phone number. If a support email has been configured for this deployment, the operator is notified. If it has not, the message is stored for the operator and is not emailed.
      </p>
      <p>
        For account access, use <Link href="/password-reset">password reset</Link>. For a security report, set the subject to “Security report” and describe the impact without including a working exploit.
      </p>
      <ContactForm />
    </PublicPage>
  );
}
