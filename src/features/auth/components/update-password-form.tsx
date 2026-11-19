"use client";

import { useActionState } from "react";
import { preservedSubmit } from "@/lib/form-submit";
import { useActionGate } from "@/lib/use-submit-guard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { updatePasswordAction, type AuthActionState } from "../actions";
import { AuthStatus } from "./auth-status";
import { PasswordField } from "./password-field";

const initialState: AuthActionState = { status: "idle" };

export function UpdatePasswordForm() {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );
  const gate = useActionGate(pending);

  return (
    <form noValidate onSubmit={preservedSubmit((formData) => { gate(() => formAction(formData)); })} className="space-y-4">
      <AuthStatus status={state.status} message={state.message} />
      <PasswordField
        id="password"
        name="password"
        label={t("auth.newPassword")}
        autoComplete="new-password"
        required
        minLength={8}
        error={state.fieldErrors?.password}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label={t("auth.confirmNewPassword")}
        autoComplete="new-password"
        required
        minLength={8}
        error={state.fieldErrors?.confirmPassword}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Updating…" : "Update password"}
      </Button>
    </form>
  );
}
