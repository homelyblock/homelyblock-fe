import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";

const features = [
  ["Resident management", "Administrators connect an existing account to a society and set the role. Access begins only when the membership is active."],
  ["Society and unit management", "Administrators record the society, its buildings, and its units, and can link a membership to a unit."],
  ["Maintenance and billing", "Administrators configure charges, generate bills for a period, and publish them. Residents can view the bills for their context."],
  ["Payment records", "Administrators record a payment collected outside HomelyBlock and can reverse that record. There is no payment gateway and no automatic bank confirmation."],
  ["Notices", "Administrators draft and publish notices for the society, a building, or a unit. Residents read the notices that apply to them."],
  ["Complaints", "Residents raise a complaint for their society. Administrators follow status and comments. Image attachments stay off unless the operator enables storage."],
  ["Visitors", "Residents register expected visitors. Authorized staff can record a walk-in. Status can move through approval, rejection, check-in, and check-out."],
  ["Households", "A resident or administrator can list the people who live in the home. Those people do not get their own logins."],
  ["Services", "Administrators publish local service contacts. Residents can look them up."],
  ["Administration", "Each society is isolated. A platform owner account is created outside public sign-up and is used to administer the platform."],
];

export const metadata = publicPageMetadata({
  title: "Features",
  description: "The society management features that are implemented in HomelyBlock today.",
  path: "/features",
});

export const instant = false;

export default function FeaturesPage() {
  return (
    <PublicPage title="Features" description="Only the workflows that exist in the product are listed here.">
      <ul className="space-y-4">
        {features.map(([title, description]) => (
          <li key={title}>
            <h2>{title}</h2>
            <p>{description}</p>
          </li>
        ))}
      </ul>
      <p>HomelyBlock does not include gate hardware, WhatsApp or SMS alerts, online collections, or a public pricing plan.</p>
    </PublicPage>
  );
}
