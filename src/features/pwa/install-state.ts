const DISMISS_KEY = "hb-pwa-install-dismissed";
const IOS_HINT_KEY = "hb-pwa-ios-hint-dismissed";
const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export type BeforeInstallPromptLike = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: window-controls-overlay)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const iPadOs = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
  return iOS || iPadOs;
}

/** Safari on iOS/iPadOS — the only place HomelyBlock's A2HS instructions apply. */
export function isIosSafari(): boolean {
  if (!isIosDevice()) return false;
  const ua = window.navigator.userAgent;
  // Chrome, Firefox, Edge, and other iOS browsers use WebKit but not Safari's Share sheet.
  if (/CriOS|FxiOS|EdgiOS|OPiOS|OPT\//i.test(ua)) return false;
  return /Safari/i.test(ua);
}

export function isInstallDismissed(now = Date.now()): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return now - at < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function dismissInstallPrompt(now = Date.now()): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(now));
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function clearInstallDismissal(): void {
  try {
    window.localStorage.removeItem(DISMISS_KEY);
  } catch {
    // ignore
  }
}

export function isIosHintDismissed(): boolean {
  try {
    return window.localStorage.getItem(IOS_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

export function dismissIosHint(): void {
  try {
    window.localStorage.setItem(IOS_HINT_KEY, "1");
  } catch {
    // ignore
  }
}

export function canShowInstallCta(options: {
  standalone: boolean;
  hasPrompt: boolean;
  dismissed: boolean;
}): boolean {
  if (options.standalone) return false;
  if (options.dismissed) return false;
  return options.hasPrompt;
}

export function canShowIosInstallHint(options: {
  standalone: boolean;
  isIos: boolean;
  dismissed: boolean;
  /** When provided, require Safari. Defaults to treating isIos as sufficient for older callers. */
  isSafari?: boolean;
}): boolean {
  if (options.standalone) return false;
  if (!options.isIos) return false;
  if (options.isSafari === false) return false;
  if (options.dismissed) return false;
  return true;
}
