"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/i18n/provider";
import { readOperatorIdentity } from "@/features/marketing/operator";

export const LEGAL_UPDATED = "18 November 2026";

export function LegalReviewNotice() {
  const { t } = useI18n();
  return (
    <p className="rounded-xl border border-border bg-muted px-4 py-3 text-sm leading-6">
      {t("detail.legalUpdated", { date: LEGAL_UPDATED })}
    </p>
  );
}

export function OperatorBlock() {
  const { t } = useI18n();
  const operator = readOperatorIdentity();
  return (
    <>
      <h2>{t("detail.operatorTitle")}</h2>
      {operator.legalName ? (
        <p>
          {t("detail.operatorNamed", {
            name: `${operator.legalName}${operator.address ? `, ${operator.address}` : ""}`,
          })}
        </p>
      ) : (
        <p>{t("detail.operatorMissing")}</p>
      )}
      <h2>{t("detail.reachTitle")}</h2>
      <p>
        {t("detail.reachBody")}{" "}
        <a href="/contact">{t("marketing.contact")}</a>
      </p>
      {operator.supportEmail ? (
        <p>{t("detail.supportSet", { email: operator.supportEmail })}</p>
      ) : (
        <p>{t("detail.supportMissing")}</p>
      )}
      {operator.grievanceEmail ? (
        <p>{t("detail.grievanceSet", { email: operator.grievanceEmail })}</p>
      ) : (
        <p>{t("detail.grievanceMissing")}</p>
      )}
    </>
  );
}

export function PolicySection({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4 [&_h2]:pt-4 [&_h2]:text-base [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}
