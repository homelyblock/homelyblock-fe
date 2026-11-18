import { createBrowserClient } from "@supabase/ssr";
import { requireSupabasePublicConfig } from "@/config/supabase-public-env";

export function createBrowserSupabaseClient() {
  const { url, anonKey } = requireSupabasePublicConfig();
  return createBrowserClient(url, anonKey);
}
