"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { updatePasswordAction, type AuthActionState } from "../actions";
import { AuthStatus } from "./auth-status";
import { PasswordField } from "./password-field";

const initialState: AuthActionState = { status: "idle" };

export function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePasswordAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthStatus status={state.status} message={state.message} />
      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={8}
        error={state.fieldErrors?.password}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
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
