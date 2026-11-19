"use client";

import { useActionState } from "react";
import { useActionGate } from "@/lib/use-submit-guard";
import { Button } from "@/components/ui/button";
import { completeOnboardingAction, type AuthActionState } from "../actions";
import { AuthStatus } from "./auth-status";

const initialState: AuthActionState = { status: "idle" };

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState,
  );
  const gate = useActionGate(pending);

  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        gate(() => formAction());
      }}
    >
      <AuthStatus status={state.status} message={state.message} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Try again"}
      </Button>
    </form>
  );
}
