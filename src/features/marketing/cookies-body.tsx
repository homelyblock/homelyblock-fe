"use client";

import { OpenCookiePreferences } from "@/features/marketing/cookie-consent";
import { LegalReviewNotice, PolicySection } from "@/features/marketing/legal-notice";
import { useI18n } from "@/i18n/provider";

export function CookiesBody() {
  const { t } = useI18n();
  return (
    <PolicySection>
      <LegalReviewNotice />
      <h2>{t("legalPages.cookiesEssentialTitle")}</h2>
      <p>{t("legalPages.cookiesEssential")}</p>
      <h2>{t("legalPages.cookiesOtherTitle")}</h2>
      <p>{t("legalPages.cookiesOther")}</p>
      <p>{t("legalPages.cookiesPref")}</p>
      <h2>{t("legalPages.cookiesChangeTitle")}</h2>
      <p>
        <OpenCookiePreferences className="font-medium underline-offset-4 hover:underline">
          {t("legalPages.cookiesOpen")}
        </OpenCookiePreferences>
      </p>
      <p>{t("legalPages.cookiesNote")}</p>
    </PolicySection>
  );
}
