"use client";

import { useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/provider";

export const THEME_STORAGE_KEY = "hb-theme";
const THEME_EVENT = "hb-theme-change";
export type ThemeChoice = "light" | "dark" | "system";

export function applyTheme(choice: ThemeChoice) {
  const dark =
    choice === "dark" ||
    (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function subscribeTheme(onChange: () => void) {
  window.addEventListener(THEME_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function currentTheme(): ThemeChoice {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const choice = useSyncExternalStore(subscribeTheme, currentTheme, () => "system" as ThemeChoice);

  return (
    <label className="inline-flex w-full min-w-0 items-center">
      <span className="sr-only">{t("theme.label")}</span>
      <select
        aria-label={t("theme.label")}
        value={choice}
        onChange={(event) => {
          const next = event.target.value as ThemeChoice;
          window.localStorage.setItem(THEME_STORAGE_KEY, next);
          applyTheme(next);
          window.dispatchEvent(new Event(THEME_EVENT));
        }}
        className={`h-11 max-w-28 rounded-lg border border-border bg-muted px-2 text-sm font-medium text-foreground ${className}`}
      >
        <option value="system">{t("theme.system")}</option>
        <option value="light">{t("theme.light")}</option>
        <option value="dark">{t("theme.dark")}</option>
      </select>
    </label>
  );
}
