"use client";

import { useActionState } from "react";
import { preservedSubmit } from "@/lib/form-submit";
import { useActionGate } from "@/lib/use-submit-guard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { signUpAction, type AuthActionState } from "../actions";
import { AuthStatus } from "./auth-status";
import { Field } from "./field";
import { PasswordField } from "./password-field";
import { RoleSetupFields } from "./role-setup-fields";

const initialState: AuthActionState = { status: "idle" };

export function SignUpForm() {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const gate = useActionGate(pending);

  return (
    <form noValidate onSubmit={preservedSubmit((formData) => { gate(() => formAction(formData)); })} className="space-y-4">
      <AuthStatus status={state.status} message={state.message} />
      <Field
        id="fullName"
        name="fullName"
        label={t("auth.fullName")}
        type="text"
        autoComplete="name"
        required
        error={state.fieldErrors?.fullName}
      />
      <Field
        id="email"
        name="email"
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <PasswordField
        id="password"
        name="password"
        label={t("auth.password")}
        autoComplete="new-password"
        required
        minLength={8}
        error={state.fieldErrors?.password}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label={t("auth.confirmPassword")}
        autoComplete="new-password"
        required
        minLength={8}
        error={state.fieldErrors?.confirmPassword}
      />
      <RoleSetupFields fieldErrors={state.fieldErrors} />
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
