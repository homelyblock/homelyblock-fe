export const PUBLIC_PATHS = new Set([
  "/",
  "/about",
  "/features",
  "/how-it-works",
  "/contact",
  "/faq",
  "/help",
  "/security",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/cookies",
  "/acceptable-use",
  "/accessibility",
  "/sign-in",
  "/admin/sign-in",
  "/sign-up",
  "/password-reset",
  "/session-expired",
  "/unavailable",
  "/auth/callback",
  "/auth/update-password",
]);

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/auth/")) return true;
  return false;
}
