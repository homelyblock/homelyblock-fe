import { cookies } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  AUTH_ENTRY_COOKIE,
  authEntryFromCookie,
  signInPathForEntry,
} from "./account-routing";

/**
 * Server helper: prefer verified claims, then expose the access token only when present.
 */
export async function getServerAccessToken(): Promise<string | null> {
  // Supabase checks token expiry with Date.now(). That must run at request time.
  await connection();
  const supabase = await createServerSupabaseClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  if (claimsError || !claimsData) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return data.session?.access_token ?? null;
}

export async function redirectToSignIn(): Promise<never> {
  const jar = await cookies();
  redirect(
    signInPathForEntry(authEntryFromCookie(jar.get(AUTH_ENTRY_COOKIE)?.value)),
  );
}
