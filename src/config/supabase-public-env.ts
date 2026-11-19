import { z } from "zod";

const supabasePublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  publicKey: z.string().min(1),
});

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

function readSupabasePublicKey(): string | undefined {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!key) return undefined;
  if (key.startsWith("sb_secret_")) {
    throw new Error(
      "The Supabase secret key cannot be used in the browser. Set NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to the publishable key.",
    );
  }
  return key;
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publicKey = readSupabasePublicKey();

  if (!url && !publicKey) {
    return null;
  }

  const parsed = supabasePublicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: url,
    publicKey,
  });

  if (!parsed.success) {
    throw new Error(
      "Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or leave all of them unset",
    );
  }

  const parsedUrl = new URL(parsed.data.NEXT_PUBLIC_SUPABASE_URL);
  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must use http or https");
  }

  return {
    url: parsedUrl.origin,
    anonKey: parsed.data.publicKey,
  };
}

export function requireSupabasePublicConfig(): SupabasePublicConfig {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error(
      "Supabase Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return config;
}
