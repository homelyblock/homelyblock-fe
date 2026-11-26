"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  canShowInstallCta,
  canShowIosInstallHint,
  dismissInstallPrompt,
  dismissIosHint,
  isInstallDismissed,
  isIosHintDismissed,
  isIosSafari,
  isStandaloneDisplay,
  type BeforeInstallPromptLike,
} from "@/features/pwa/install-state";
import {
  registerHomelyBlockServiceWorker,
  requestSkipWaiting,
  watchForWaitingWorker,
} from "@/features/pwa/register-sw";
import { useI18n } from "@/i18n/provider";

type PwaContextValue = {
  standalone: boolean;
  online: boolean;
  canInstall: boolean;
  showIosHint: boolean;
  updateAvailable: boolean;
  install: () => Promise<void>;
  dismissInstall: () => void;
  dismissIos: () => void;
  dismissUpdate: () => void;
  applyUpdate: () => Promise<void>;
};

const UPDATE_DISMISS_KEY = "hb-pwa-update-dismissed";

const PwaContext = createContext<PwaContextValue | null>(null);

export function usePwa(): PwaContextValue {
  const value = useContext(PwaContext);
  if (!value) {
    throw new Error("usePwa must be used within PwaProvider");
  }
  return value;
}

export function usePwaOptional(): PwaContextValue | null {
  return useContext(PwaContext);
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

function getOnlineSnapshot() {
  return navigator.onLine;
}

function getOnlineServerSnapshot() {
  return true;
}

function subscribeStandalone(onChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  media.addEventListener("change", onChange);
  window.addEventListener("appinstalled", onChange);
  return () => {
    media.removeEventListener("change", onChange);
    window.removeEventListener("appinstalled", onChange);
  };
}

function getStandaloneSnapshot() {
  return isStandaloneDisplay();
}

function getStandaloneServerSnapshot() {
  return false;
}

export function PwaProvider({ children }: { children: ReactNode }) {
  const online = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    getOnlineServerSnapshot,
  );
  const standalone = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    getStandaloneServerSnapshot,
  );
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptLike | null>(null);
  const [installDismissed, setInstallDismissed] = useState(false);
  const [iosDismissed, setIosDismissed] = useState(false);
  const [isSafariIos, setIsSafariIos] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const reloadOnControllerChange = useRef(false);

  useEffect(() => {
    let cancelled = false;
    // Defer client preference reads so the effect body stays free of sync setState.
    queueMicrotask(() => {
      if (cancelled) return;
      setHydrated(true);
      setInstallDismissed(isInstallDismissed());
      setIosDismissed(isIosHintDismissed());
      setIsSafariIos(isIosSafari());
      try {
        setUpdateDismissed(sessionStorage.getItem(UPDATE_DISMISS_KEY) === "1");
      } catch {
        setUpdateDismissed(false);
      }
    });

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptLike);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    const onInstalled = () => {
      setDeferredPrompt(null);
      setUpdateAvailable(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    let unwatch: (() => void) | undefined;

    void registerHomelyBlockServiceWorker().then((result) => {
      if (cancelled || !result.registration) return;
      setRegistration(result.registration);
      unwatch = watchForWaitingWorker(result.registration, () => {
        if (cancelled) return;
        try {
          sessionStorage.removeItem(UPDATE_DISMISS_KEY);
        } catch {
          // ignore
        }
        setUpdateDismissed(false);
        setUpdateAvailable(true);
      });
      void result.registration.update().catch(() => undefined);
    });

    const onControllerChange = () => {
      // Reload only the tab that explicitly requested Update — never all tabs.
      if (!reloadOnControllerChange.current) return;
      reloadOnControllerChange.current = false;
      window.location.reload();
    };
    navigator.serviceWorker?.addEventListener("controllerchange", onControllerChange);

    return () => {
      cancelled = true;
      unwatch?.();
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
      navigator.serviceWorker?.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "dismissed") {
        dismissInstallPrompt();
        setInstallDismissed(true);
      }
    } catch {
      // Keep CTA available if the browser rejects a non-gesture prompt.
    } finally {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    dismissInstallPrompt();
    setInstallDismissed(true);
    setDeferredPrompt(null);
  }, []);

  const dismissIos = useCallback(() => {
    dismissIosHint();
    setIosDismissed(true);
  }, []);

  const dismissUpdate = useCallback(() => {
    try {
      sessionStorage.setItem(UPDATE_DISMISS_KEY, "1");
    } catch {
      // ignore
    }
    setUpdateDismissed(true);
  }, []);

  const applyUpdate = useCallback(async () => {
    if (!registration) {
      window.location.reload();
      return;
    }
    reloadOnControllerChange.current = true;
    await requestSkipWaiting(registration);
  }, [registration]);

  const canInstall =
    hydrated &&
    canShowInstallCta({
      standalone,
      hasPrompt: deferredPrompt !== null,
      dismissed: installDismissed,
    });

  const showIosHint =
    hydrated &&
    canShowIosInstallHint({
      standalone,
      isIos: isSafariIos,
      isSafari: true,
      dismissed: iosDismissed,
    });

  const showUpdate = updateAvailable && !updateDismissed;

  const value = useMemo<PwaContextValue>(
    () => ({
      standalone,
      online,
      canInstall,
      showIosHint,
      updateAvailable: showUpdate,
      install,
      dismissInstall,
      dismissIos,
      dismissUpdate,
      applyUpdate,
    }),
    [
      standalone,
      online,
      canInstall,
      showIosHint,
      showUpdate,
      install,
      dismissInstall,
      dismissIos,
      dismissUpdate,
      applyUpdate,
    ],
  );

  return (
    <PwaContext.Provider value={value}>
      {children}
      <PwaChrome />
    </PwaContext.Provider>
  );
}

function PwaChrome() {
  const { t } = useI18n();
  const pwa = usePwa();
  // Keep below cookie consent (z-50) so first-visit preferences stay unobstructed.
  const showInstallBanner = pwa.canInstall && !pwa.updateAvailable;
  const showIosBanner = pwa.showIosHint && !pwa.canInstall && !pwa.updateAvailable;

  return (
    <>
      {!pwa.online ? (
        <div
          role="status"
          className="fixed inset-x-0 top-0 z-[60] border-b border-warning/30 bg-warning/15 px-3 py-2 text-center text-sm text-warning"
          style={{ paddingTop: "max(0.5rem, env(safe-area-inset-top))" }}
        >
          {t("pwa.offlineBanner")}{" "}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => window.location.reload()}
          >
            {t("common.retry")}
          </button>
        </div>
      ) : null}

      {pwa.updateAvailable ? (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
          <div
            role="status"
            className="mx-auto flex w-full max-w-lg items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm"
          >
            <p className="min-w-0 flex-1 text-sm text-foreground">{t("pwa.updateAvailable")}</p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-3 text-sm font-medium"
                onClick={pwa.dismissUpdate}
              >
                {t("pwa.notNow")}
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground"
                onClick={() => void pwa.applyUpdate()}
              >
                {t("pwa.updateNow")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showInstallBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
          <div
            role="region"
            aria-label={t("pwa.installTitle")}
            className="mx-auto flex w-full max-w-lg flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">{t("pwa.installTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("pwa.installBody")}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-3 text-sm font-medium"
                onClick={pwa.dismissInstall}
              >
                {t("pwa.notNow")}
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-3 text-sm font-medium text-primary-foreground"
                onClick={() => void pwa.install()}
              >
                {t("pwa.install")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showIosBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4">
          <div
            role="region"
            aria-label={t("pwa.iosTitle")}
            className="mx-auto w-full max-w-lg rounded-2xl border border-border bg-card p-4 shadow-sm"
          >
            <p className="text-sm font-semibold text-foreground">{t("pwa.iosTitle")}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{t("pwa.iosBody")}</p>
            <button
              type="button"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-3 text-sm font-medium"
              onClick={pwa.dismissIos}
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
