export const COOKIE_PREFERENCES_NAME = "ls_cookie_preferences";
export const COOKIE_PREFERENCES_EVENT = "ls-open-cookie-preferences";
export const COOKIE_PREFERENCES_MAX_AGE = 60 * 60 * 24 * 180;

export type CookieChoice = "accept_all" | "reject_non_essential" | "custom";

/**
 * Optional categories stay off. LivingSpace does not load analytics or
 * marketing scripts, so a saved "accept all" choice must not be treated as
 * permission to inject them later without a real gate.
 */
export type CookiePreferences = {
  essential: true;
  functional: false;
  analytics: false;
  marketing: false;
  choice: CookieChoice;
  updatedAt: string;
};

export function preferencesFor(choice: CookieChoice, updatedAt: string): CookiePreferences {
  return {
    essential: true,
    functional: false,
    analytics: false,
    marketing: false,
    choice,
    updatedAt,
  };
}

export function allowsOptionalTracking(): boolean {
  return false;
}

export function serializePreferences(preferences: CookiePreferences): string {
  return encodeURIComponent(JSON.stringify(preferences));
}

export function parsePreferences(raw: string | null | undefined): CookiePreferences | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CookiePreferences>;
    if (
      parsed.essential !== true ||
      parsed.functional !== false ||
      parsed.analytics !== false ||
      parsed.marketing !== false ||
      (parsed.choice !== "accept_all" &&
        parsed.choice !== "reject_non_essential" &&
        parsed.choice !== "custom") ||
      typeof parsed.updatedAt !== "string"
    ) {
      return null;
    }
    return {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
      choice: parsed.choice,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function readPreferencesFromDocumentCookie(cookieHeader: string): CookiePreferences | null {
  const parts = cookieHeader.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${COOKIE_PREFERENCES_NAME}=`));
  if (!match) return null;
  return parsePreferences(match.slice(COOKIE_PREFERENCES_NAME.length + 1));
}
