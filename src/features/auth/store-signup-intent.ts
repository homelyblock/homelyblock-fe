import { apiRequest } from "@/services/api-client";
import type { SignupIntentPayload } from "./account-routing";

/**
 * Server-only. The signup-intent key is read here and must never be prefixed
 * with NEXT_PUBLIC_.
 */
export async function storeSignupIntent(
  input: SignupIntentPayload,
): Promise<void> {
  const secret = process.env.SIGNUP_INTENT_SECRET?.trim();
  if (!secret) {
    throw new Error("Signup intent storage is not configured.");
  }

  await apiRequest("/api/v1/signup-intents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-signup-intent-key": secret,
    },
    body: JSON.stringify(input),
  });
}
