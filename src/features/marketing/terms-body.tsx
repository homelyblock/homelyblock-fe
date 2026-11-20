"use client";

import { useI18n } from "@/i18n/provider";
import { LegalReviewNotice, OperatorBlock, PolicySection } from "@/features/marketing/legal-notice";

export function TermsBody() {
  const { t } = useI18n();
  return (
    <PolicySection>
      <LegalReviewNotice />
      <OperatorBlock />
      <h2>{t("detail.termsEligibilityTitle")}</h2>
      <p>{t("detail.termsEligibility")}</p>
      <h2>{t("detail.termsRolesTitle")}</h2>
      <ul>
        <li>{t("detail.termsOwner")}</li>
        <li>{t("detail.termsAdmin")}</li>
        <li>{t("detail.termsResident")}</li>
      </ul>
      <h2>{t("detail.termsUseTitle")}</h2>
      <p>
        {t("detail.termsUse")} <a href="/acceptable-use">{t("detail.aupTitle")}</a>
      </p>
      <h2>{t("detail.termsContentTitle")}</h2>
      <p>{t("detail.termsContent")}</p>
      <h2>{t("detail.termsPayTitle")}</h2>
      <p>{t("detail.termsPay")}</p>
      <h2>{t("detail.termsSuspendTitle")}</h2>
      <p>{t("detail.termsSuspend")}</p>
      <h2>{t("detail.termsAvailTitle")}</h2>
      <p>{t("detail.termsAvail")}</p>
      <h2>{t("detail.termsIpTitle")}</h2>
      <p>{t("detail.termsIp")}</p>
      <h2>{t("detail.termsLiabilityTitle")}</h2>
      <p>{t("detail.termsLiability")}</p>
      <h2>{t("detail.termsLawTitle")}</h2>
      <p>{t("detail.termsLaw")}</p>
      <h2>{t("detail.termsContactTitle")}</h2>
      <p>{t("detail.termsContact")}</p>
    </PolicySection>
  );
}
