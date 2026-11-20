"use client";

import { LegalReviewNotice, OperatorBlock, PolicySection } from "@/features/marketing/legal-notice";
import { useI18n } from "@/i18n/provider";

const CONTROLS = ["sec1", "sec2", "sec3", "sec4", "sec5", "sec6", "sec7", "sec8", "sec9"] as const;

export function SecurityBody() {
  const { t } = useI18n();
  return (
    <PolicySection>
      <LegalReviewNotice />
      <h2>{t("legalPages.securityControlsTitle")}</h2>
      <ul>
        {CONTROLS.map((key) => (
          <li key={key}>{t(`legalPages.${key}`)}</li>
        ))}
      </ul>
      <h2>{t("legalPages.securityAbsentTitle")}</h2>
      <p>{t("legalPages.securityAbsent")}</p>
      <h2>{t("legalPages.securityReportTitle")}</h2>
      <OperatorBlock />
      <p>{t("legalPages.securityReport")}</p>
      <h2>{t("legalPages.securityCertTitle")}</h2>
      <p>{t("legalPages.securityCert")}</p>
    </PolicySection>
  );
}
