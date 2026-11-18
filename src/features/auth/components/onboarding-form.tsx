"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { completeOnboardingAction, type AuthActionState } from "../actions";
import { AuthStatus } from "./auth-status";

const initialState: AuthActionState = { status: "idle" };

export function OnboardingForm() {
  const [state, formAction, pending] = useActionState(
    completeOnboardingAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <AuthStatus status={state.status} message={state.message} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Try again"}
      </Button>
    </form>
  );
}
