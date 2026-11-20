"use client";

import { LegalReviewNotice, PolicySection } from "@/features/marketing/legal-notice";
import { useI18n } from "@/i18n/provider";

const POINTS = ["acc1", "acc2", "acc3", "acc4", "acc5", "acc6"] as const;

export function AccessibilityBody() {
  const { t } = useI18n();
  return (
    <PolicySection>
      <LegalReviewNotice />
      <h2>{t("legalPages.accessIncludesTitle")}</h2>
      <ul>
        {POINTS.map((key) => (
          <li key={key}>{t(`legalPages.${key}`)}</li>
        ))}
      </ul>
      <h2>{t("legalPages.accessClaimTitle")}</h2>
      <p>{t("legalPages.accessClaim")}</p>
    </PolicySection>
  );
}
