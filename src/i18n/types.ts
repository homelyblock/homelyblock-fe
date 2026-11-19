export const LOCALES = ["en", "mr", "hi"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_COOKIE = "hb-locale";
export const LOCALE_STORAGE_KEY = "hb-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "mr" || value === "hi";
}

export function intlLocale(locale: Locale): string {
  if (locale === "mr") return "mr-IN";
  if (locale === "hi") return "hi-IN";
  return "en-IN";
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  mr: "मराठी",
  hi: "हिंदी",
};
