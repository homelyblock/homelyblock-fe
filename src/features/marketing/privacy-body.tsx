"use client";

import { LegalReviewNotice, OperatorBlock, PolicySection } from "@/features/marketing/legal-notice";
import { useI18n } from "@/i18n/provider";

export function PrivacyPolicyBody() {
  const { t } = useI18n();
  const stores = [
    "privacyStore1",
    "privacyStore2",
    "privacyStore3",
    "privacyStore4",
    "privacyStore5",
    "privacyStore6",
    "privacyStore7",
    "privacyStore8",
    "privacyStore9",
    "privacyStore10",
    "privacyStore11",
    "privacyStore12",
  ] as const;

  return (
    <PolicySection>
      <LegalReviewNotice />
      <h2>{t("legalPages.privacyCoverTitle")}</h2>
      <p>{t("legalPages.privacyCover")}</p>
      <OperatorBlock />
      <h2>{t("legalPages.privacyStoresTitle")}</h2>
      <ul>
        {stores.map((key) => (
          <li key={key}>{t(`legalPages.${key}`)}</li>
        ))}
      </ul>
      <h2>{t("legalPages.privacyWhyTitle")}</h2>
      <p>{t("legalPages.privacyWhy")}</p>
      <p>{t("legalPages.privacyDpdp")}</p>
      <p>{t("legalPages.privacyNotYet")}</p>
      <h2>{t("legalPages.privacyWhoTitle")}</h2>
      <p>{t("legalPages.privacyWho")}</p>
      <h2>{t("legalPages.privacyShareTitle")}</h2>
      <p>{t("legalPages.privacyShare")}</p>
      <h2>{t("legalPages.privacyKeepTitle")}</h2>
      <p>{t("legalPages.privacyKeep")}</p>
      <h2>{t("legalPages.privacySecurityTitle")}</h2>
      <p>{t("legalPages.privacySecurity")}</p>
      <h2>{t("legalPages.privacyChildrenTitle")}</h2>
      <p>{t("legalPages.privacyChildren")}</p>
      <h2>{t("legalPages.privacyRequestsTitle")}</h2>
      <p>{t("legalPages.privacyRequests")}</p>
      <h2>{t("legalPages.privacyCertTitle")}</h2>
      <p>{t("legalPages.privacyCert")}</p>
      <h2>{t("legalPages.privacyUpdatesTitle")}</h2>
      <p>{t("legalPages.privacyUpdates")}</p>
    </PolicySection>
  );
}
