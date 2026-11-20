import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/config/supabase-public-env";
import {
  AUTH_ENTRY_COOKIE,
  authEntryFromCookie,
  signInPathForEntry,
} from "@/features/auth/account-routing";
import { isPublicPath } from "@/features/shell/public-paths";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const config = getSupabasePublicConfig();
  if (!config) {
    if (!isPublicPath(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = signInPathForEntry(
        authEntryFromCookie(request.cookies.get(AUTH_ENTRY_COOKIE)?.value),
      );
      url.search = "";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  const recoveryRedirect = await consumePasswordRecovery(request, supabase);
  if (recoveryRedirect) {
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      recoveryRedirect.cookies.set(cookie);
    });
    return recoveryRedirect;
  }

  // Refresh the session. Do not trust getSession() alone for authorization.
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims);

  if (!isAuthenticated && !isPublicPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = signInPathForEntry(
      authEntryFromCookie(request.cookies.get(AUTH_ENTRY_COOKIE)?.value),
    );
    url.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

/**
 * Recovery emails can land on the password form with a one-time code.
 * Exchange it here so the session cookie is set before the page renders.
 */
async function consumePasswordRecovery(
  request: NextRequest,
  supabase: {
    auth: {
      exchangeCodeForSession: (
        code: string,
      ) => Promise<{ error: { message: string } | null }>;
      verifyOtp: (input: {
        type: "recovery";
        token_hash: string;
      }) => Promise<{ error: { message: string } | null }>;
    };
  },
): Promise<NextResponse | null> {
  if (request.nextUrl.pathname !== "/auth/update-password") return null;
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  if (!code && !(tokenHash && otpType === "recovery")) return null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        type: "recovery",
        token_hash: tokenHash ?? "",
      });

  const url = request.nextUrl.clone();
  url.search = "";
  if (error) {
    url.pathname = "/password-reset";
    url.searchParams.set("error", "recovery");
  }
  return NextResponse.redirect(url);
}
