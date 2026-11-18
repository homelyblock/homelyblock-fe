/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative and absolute URLs (open-redirect defense).
 */
export function safeAuthRedirectPath(
  next: string | null | undefined,
  fallback = "/societies",
): string {
  if (!next) return fallback;
  const trimmed = next.trim();
  if (!trimmed.startsWith("/")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("://")) return fallback;
  if (trimmed.includes("\\")) return fallback;
  const pathOnly = trimmed.split("?")[0]?.split("#")[0] ?? trimmed;
  if (
    pathOnly === "/sign-in" ||
    pathOnly === "/admin/sign-in" ||
    pathOnly === "/sign-up" ||
    pathOnly === "/password-reset" ||
    pathOnly === "/session-expired" ||
    pathOnly.startsWith("/auth/")
  ) {
    return fallback;
  }
  return trimmed;
}
