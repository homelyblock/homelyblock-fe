import { createBrowserSupabaseClient } from "@/lib/supabase/client";

/**
 * Browser helper: read the current access token for NestJS Authorization headers.
 * Never treat presence of a session as backend authorization.
 */
export async function getBrowserAccessToken(): Promise<string | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return data.session?.access_token ?? null;
}
