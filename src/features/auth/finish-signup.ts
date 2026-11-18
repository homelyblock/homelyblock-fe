import { cookies } from "next/headers";
import { ApiError } from "@/services/api-client";
import { fetchMe } from "@/features/societies/api";
import type { MeResponse } from "@/features/societies/types";
import { AUTH_ENTRY_COOKIE } from "./account-routing";
import { submitOnboarding } from "./onboarding";

/**
 * Applies the registration choice stored by the server at sign-up.
 * Supabase user metadata is not read. The onboarding request has no role body.
 */
export async function finishStoredSignup(
  accessToken: string,
  me: MeResponse,
): Promise<MeResponse> {
  if (me.platformRole === "PLATFORM_OWNER" || me.accountType) {
    return me;
  }

  try {
    const updated = await submitOnboarding(accessToken);
    const jar = await cookies();
    jar.set(AUTH_ENTRY_COOKIE, "member", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return updated;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      return fetchMe(accessToken);
    }
    throw error;
  }
}
