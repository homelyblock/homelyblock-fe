import { PublicPage } from "@/features/marketing/public-page";
import { publicPageMetadata } from "@/features/marketing/public-metadata";
import { PrivacyPolicyBody } from "@/features/marketing/privacy-body";

export const metadata = publicPageMetadata({
  title: "Privacy policy",
  description: "How LivingSpace stores account, society, household, billing, complaint, and visitor information.",
  path: "/privacy-policy",
});

export const instant = false;

export default function PrivacyPolicyPage() {
  return (
    <PublicPage
      title="Privacy policy"
      description="What LivingSpace stores, who can see it, and which Indian privacy duties are already in force."
    >
      <PrivacyPolicyBody />
    </PublicPage>
  );
}
