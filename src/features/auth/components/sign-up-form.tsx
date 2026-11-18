"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { signUpAction, type AuthActionState } from "../actions";
import { AuthStatus } from "./auth-status";
import { Field } from "./field";
import { PasswordField } from "./password-field";
import { RoleSetupFields } from "./role-setup-fields";

const initialState: AuthActionState = { status: "idle" };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <AuthStatus status={state.status} message={state.message} />
      <Field
        id="fullName"
        name="fullName"
        label="Full name"
        type="text"
        autoComplete="name"
        required
        error={state.fieldErrors?.fullName}
      />
      <Field
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        error={state.fieldErrors?.email}
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={8}
        error={state.fieldErrors?.password}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
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
