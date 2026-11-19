import Link from "next/link";
import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";

const faqs = [
  ["What is HomelyBlock?", "HomelyBlock is a web application for a residential society. It keeps residents, units, notices, visitors, maintenance bills, recorded payments, complaints, household members, and a services directory together."],
  ["Who can use it?", "A society administrator, a resident with an active membership, and a platform owner provisioned outside the public sign-up. An account alone does not open a society."],
  ["How does a society register?", "A society administrator creates an account, confirms the sign-in email, and sets up the society. A platform owner can also create a society and assign an administrator."],
  ["How can residents join?", "A resident registers a login and confirms their email. An administrator connects that existing account to the society. HomelyBlock does not send an invitation email."],
  ["How is membership approved?", "A new membership is invited. It does not grant access until an administrator activates it. A suspended or removed membership loses access. Historical bills stay in the society record."],
  ["What can a society administrator manage?", "Their own society’s profile, buildings, units, members, notices, complaints, billing, recorded payments, visitors, services, and the household records their role allows."],
  ["What can a resident access?", "Notices that apply to them, their maintenance bills and payment records, their complaints, visitor requests, household details, society services, and their profile. Not another resident’s private records and not another society."],
  ["Can a resident belong to multiple societies?", "Yes. Membership is unique per society, so one login can be active in more than one society. Each society’s data stays separate."],
  ["How are maintenance bills managed?", "An administrator configures charges, generates bills for a period, and publishes them. Residents view the bills in their society context."],
  ["How are payments verified?", "They are not verified with a bank or UPI app. An administrator records a payment that was collected outside HomelyBlock, by cash, UPI, bank transfer, cheque, or another method, and can reverse that record. There is no payment webhook."],
  ["How can complaints be submitted?", "A resident submits a complaint inside their society and can follow comments and status. This is not a HomelyBlock platform support ticket. Image attachments are disabled unless the operator turns storage on."],
  ["How are visitors managed?", "Residents register expected visitors. Authorized staff can record a walk-in. A visit can be pending, approved, rejected, checked in, checked out, cancelled, or expired. There is no gate hardware."],
  ["How can users reset passwords?", "Use Forgot password on the sign-in page. The sign-in service emails a link when the address has an account. The page does not say whether the address is registered."],
  ["How can accounts be deactivated?", "There is no self-service delete button. An administrator can suspend or remove a membership. Closing the underlying login, and deleting historical bills, is an operator task. Financial history is retained."],
  ["How can users contact support?", "Society matters go to the society administrator. Platform questions use the contact form. A public support email is shown only when the operator has configured one."],
  ["How is personal information protected?", "The API checks identity, role, and society on each request. Passwords are not stored in the HomelyBlock database. Selected administrative actions are written to an audit log. These controls reduce risk. They are not a guarantee. Details are in the privacy policy and the security page."],
];

export const metadata = publicPageMetadata({
  title: "FAQ",
  description: "Answers about accounts, membership, bills, complaints, visitors, and support in HomelyBlock.",
  path: "/faq",
});

export const instant = false;

export default function FaqPage() {
  return (
    <PublicPage layout="wide" title="Frequently asked questions" description="Answers match the product as it works today.">
      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {faqs.map(([question, answer]) => (
          <details key={question} className="px-5 py-4">
            <summary className="cursor-pointer text-sm font-medium">{question}</summary>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-sm leading-6 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
        Still stuck? Read the <Link href="/help">Help Center</Link> or <Link href="/contact">contact the platform</Link>.
      </p>
    </PublicPage>
  );
}
