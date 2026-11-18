"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  requestPasswordResetAction,
  type AuthActionState,
} from "../actions";
import { AuthStatus } from "./auth-status";
import { Field } from "./field";

const initialState: AuthActionState = { status: "idle" };

export function PasswordResetForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthStatus status={state.status} message={state.message} />
      <Field
        id="email"
        name="email"
        label="Email"
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
