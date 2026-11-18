"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  COOKIE_PREFERENCES_EVENT,
  COOKIE_PREFERENCES_MAX_AGE,
  COOKIE_PREFERENCES_NAME,
  type CookieChoice,
  preferencesFor,
  readPreferencesFromDocumentCookie,
} from "@/features/marketing/cookie-preferences";

const COOKIE_PREFERENCES_CHANGED = "ls-cookie-preferences-changed";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(COOKIE_PREFERENCES_CHANGED, onStoreChange);
  return () => window.removeEventListener(COOKIE_PREFERENCES_CHANGED, onStoreChange);
}

function getClientSnapshot() {
  return document.cookie;
}

function persist(choice: CookieChoice) {
  const preferences = preferencesFor(choice, new Date().toISOString());
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_PREFERENCES_NAME}=${encodeURIComponent(JSON.stringify(preferences))}; Path=/; Max-Age=${COOKIE_PREFERENCES_MAX_AGE}; SameSite=Lax${secure}`;
  return preferences;
}

export function OpenCookiePreferences({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
    >
      {children}
    </button>
  );
}

export function CookieConsent() {
  const cookie = useSyncExternalStore(subscribe, getClientSnapshot, () => null);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(COOKIE_PREFERENCES_EVENT, reopen);
    return () => window.removeEventListener(COOKIE_PREFERENCES_EVENT, reopen);
  }, []);

  if (cookie === null) return null;
  const saved = readPreferencesFromDocumentCookie(cookie);
  if (!reopened && saved) return null;

  function choose(choice: CookieChoice) {
    persist(choice);
    setReopened(false);
    window.dispatchEvent(new Event(COOKIE_PREFERENCES_CHANGED));
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 sm:px-4 sm:pb-4">
      <section
        aria-labelledby="cookie-preferences-title"
        className="mx-auto w-full max-w-3xl rounded-2xl border border-border bg-card p-4 text-foreground shadow-sm sm:p-5"
      >
        <h2 id="cookie-preferences-title" className="text-base font-semibold">
          Cookie preferences
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          LivingSpace uses essential cookies to keep you signed in. It does not set analytics or marketing cookies, and choosing Accept all does not turn any tracking on.
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <strong className="font-medium">Essential.</strong> Always on. These keep the sign-in session.
          </li>
          <li>
            <strong className="font-medium">Functional, analytics, and marketing.</strong> Not used. These stay off.
          </li>
        </ul>
        {saved ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Current choice: {saved.choice.replaceAll("_", " ")}. You can change it at any time.
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground"
            onClick={() => choose("accept_all")}
          >
            Accept all
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium"
            onClick={() => choose("reject_non_essential")}
          >
            Reject non-essential
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium"
            onClick={() => choose("custom")}
          >
            Save preferences
          </button>
        </div>
      </section>
    </div>
  );
}
