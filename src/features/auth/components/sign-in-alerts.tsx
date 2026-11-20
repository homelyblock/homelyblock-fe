"use client";

import { Alert } from "@/components/ui/alert";
import { useI18n } from "@/i18n/provider";

export function SignInAlerts({
  error,
  configured,
}: {
  error?: string;
  configured: boolean;
}) {
  const { t } = useI18n();
  return (
    <>
      {error === "auth_callback" ? <Alert>{t("work.authCallbackFailed")}</Alert> : null}
      {error === "password_updated" ? <Alert>{t("work.passwordUpdated")}</Alert> : null}
      {!configured ? <Alert tone="warning">{t("work.signInNotConfigured")}</Alert> : null}
    </>
  );
}
