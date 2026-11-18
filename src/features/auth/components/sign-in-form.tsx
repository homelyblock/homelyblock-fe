"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
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
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="audience" value={audience} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
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
      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="current-password"
        required
        error={state.fieldErrors?.password}
      />
      <div className="flex items-center justify-between gap-3">
        <Button type="submit" disabled={pending} className="min-w-28">
          {pending ? "Signing in…" : "Sign in"}
        </Button>
        <Link
          href="/password-reset"
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
    </form>
  );
}
