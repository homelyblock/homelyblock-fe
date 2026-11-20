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
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const supabase = await createServerSupabaseClient();
  const exchanged = await exchangeAuthCallback(supabase, {
    code,
    tokenHash,
    otpType,
  });

  if (exchanged.ok) {
    const token = exchanged.accessToken;
    let home = "/societies";
    if (token) {
      try {
        const me = await finishStoredSignup(token, await fetchMe(token));
        home = homePathForAccount(me);
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
    const next = safeAuthRedirectPath(searchParams.get("next"), home);
    return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL("/sign-in?error=auth_callback", origin));
}

const OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

async function exchangeAuthCallback(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  input: { code: string | null; tokenHash: string | null; otpType: string | null },
): Promise<{ ok: true; accessToken?: string } | { ok: false }> {
  if (input.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(input.code);
    if (error) return { ok: false };
    return { ok: true, accessToken: data.session?.access_token };
  }
  if (input.tokenHash && input.otpType && OTP_TYPES.has(input.otpType)) {
    const { data, error } = await supabase.auth.verifyOtp({
      type: input.otpType as "recovery",
      token_hash: input.tokenHash,
    });
    if (error) return { ok: false };
    return { ok: true, accessToken: data.session?.access_token };
  }
  return { ok: false };
}
