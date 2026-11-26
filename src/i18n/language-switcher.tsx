"use client";

import { LOCALE_LABELS, LOCALES, type Locale } from "./types.ts";
import { useI18n } from "./provider.tsx";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <label className={`inline-flex items-center ${className}`}>
      <span className="sr-only">{t("language.label")}</span>
      <select
        aria-label={t("language.label")}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="h-9 max-w-28 rounded-lg border border-border bg-muted px-2 text-sm font-medium text-foreground"
      >
        {LOCALES.map((item) => (
          <option key={item} value={item}>
            {LOCALE_LABELS[item]}
          </option>
        ))}
      </select>
    </label>
  );
}
