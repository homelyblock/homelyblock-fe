"use client";

import { useActionState } from "react";
import { preservedSubmit } from "@/lib/form-submit";
import { useActionGate } from "@/lib/use-submit-guard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import {
  requestPasswordResetAction,
  type AuthActionState,
} from "../actions";
import { AuthStatus } from "./auth-status";
import { Field } from "./field";

const initialState: AuthActionState = { status: "idle" };

export function PasswordResetForm() {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );
  const gate = useActionGate(pending);

  return (
    <form noValidate onSubmit={preservedSubmit((formData) => { gate(() => formAction(formData)); })} className="space-y-4">
      <AuthStatus status={state.status} message={state.message} />
      <Field
        id="email"
        name="email"
        label={t("auth.email")}
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Sending reset link…" : "Send reset link"}
      </Button>
    </form>
  );
}
