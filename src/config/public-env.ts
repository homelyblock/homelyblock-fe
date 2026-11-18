import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url(),
});

export type PublicConfig = {
  apiUrl: string;
};

export function getPublicConfig(): PublicConfig {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is required. Set it to the NestJS API origin (no /api/v1 path).",
    );
  }

  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: raw,
  });

  if (!parsed.success) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be an absolute http(s) URL with no path",
    );
  }

  const url = new URL(parsed.data.NEXT_PUBLIC_API_URL);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_URL must use http or https");
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be an origin without credentials, query, or hash",
    );
  }
  if (url.pathname !== "/") {
    throw new Error(
      "NEXT_PUBLIC_API_URL must be the API origin. Do not include the /api/v1 prefix",
    );
  }

  return { apiUrl: url.origin };
}
