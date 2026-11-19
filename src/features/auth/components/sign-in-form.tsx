"use client";

import Link from "next/link";
import { preservedSubmit } from "@/lib/form-submit";
import { useActionGate } from "@/lib/use-submit-guard";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/provider";
import { signInAction, type AuthActionState } from "../actions";
import { AuthStatus } from "./auth-status";
import { Field } from "./field";
import { PasswordField } from "./password-field";

const initialState: AuthActionState = { status: "idle" };

type SignInFormProps = {
  audience: "member" | "platform";
  nextPath?: string | null;
};

export function SignInForm({ audience, nextPath }: SignInFormProps) {
  const { t } = useI18n();
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const gate = useActionGate(pending);

  return (
    <form noValidate onSubmit={preservedSubmit((formData) => { gate(() => formAction(formData)); })} className="space-y-4">
      <input type="hidden" name="audience" value={audience} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
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
      <PasswordField
        id="password"
        name="password"
        label={t("auth.password")}
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" disabled={pending} className="min-w-28">
          {pending ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
        <Link
          href="/password-reset"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          {t("auth.forgot")}
        </Link>
      </div>
    </form>
  );
}
