"use client";

import { useI18n } from "@/i18n/provider";
import { LegalReviewNotice, PolicySection } from "@/features/marketing/legal-notice";

export function AcceptableUseBody() {
  const { t } = useI18n();
  return (
    <PolicySection>
      <LegalReviewNotice />
      <h2>{t("detail.aupExpectedTitle")}</h2>
      <p>{t("detail.aupExpected")}</p>
      <h2>{t("detail.aupProhibitedTitle")}</h2>
      <ul>
        <li>{t("detail.aup1")}</li>
        <li>{t("detail.aup2")}</li>
        <li>{t("detail.aup3")}</li>
        <li>{t("detail.aup4")}</li>
        <li>{t("detail.aup5")}</li>
        <li>{t("detail.aup6")}</li>
        <li>{t("detail.aup7")}</li>
      </ul>
    </PolicySection>
  );
}
