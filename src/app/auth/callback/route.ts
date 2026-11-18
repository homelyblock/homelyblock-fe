import { NextResponse, type NextRequest } from "next/server";
import { ApiError } from "@/services/api-client";
import { homePathForAccount } from "@/features/auth/account-routing";
import { finishStoredSignup } from "@/features/auth/finish-signup";
import { safeAuthRedirectPath } from "@/features/auth/safe-redirect";
import { fetchMe } from "@/features/societies/api";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeAuthRedirectPath(searchParams.get("next"), "/societies");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const token = data.session?.access_token;
      if (token) {
        try {
          const me = await finishStoredSignup(token, await fetchMe(token));
          if (me.platformRole !== "PLATFORM_OWNER") {
            return NextResponse.redirect(
              new URL(homePathForAccount(me), origin),
            );
          }
        } catch (setupError) {
          const message =
            setupError instanceof ApiError
              ? setupError.message
              : "Account setup could not be completed.";
          return NextResponse.redirect(
            new URL(
              `/onboarding?error=${encodeURIComponent(message.slice(0, 180))}`,
              origin,
            ),
          );
        }
      }
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  return NextResponse.redirect(new URL("/sign-in?error=auth_callback", origin));
}
