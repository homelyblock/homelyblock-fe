"use client";

import { useEffect } from "react";
import { applyTheme, THEME_STORAGE_KEY, type ThemeChoice } from "./theme-switcher";

export function ThemeSync() {
  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    const choice: ThemeChoice =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    applyTheme(choice);
    if (choice !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return null;
}
