export type ServiceWorkerRegistrationResult = {
  registration: ServiceWorkerRegistration | null;
  error: Error | null;
};

/**
 * Registers the HomelyBlock service worker. Failures are non-fatal — the app
 * must keep working if registration is blocked or unsupported.
 */
export async function registerHomelyBlockServiceWorker(): Promise<ServiceWorkerRegistrationResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return { registration: null, error: null };
  }

  // Avoid registering during local `next dev` HMR noise unless explicitly enabled.
  if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_PWA_DEV !== "1") {
    return { registration: null, error: null };
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    return { registration, error: null };
  } catch (error) {
    return {
      registration: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function requestSkipWaiting(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  const waiting = registration.waiting;
  if (!waiting) return;
  waiting.postMessage({ type: "SKIP_WAITING" });
}

export function watchForWaitingWorker(
  registration: ServiceWorkerRegistration,
  onWaiting: (worker: ServiceWorker) => void,
): () => void {
  if (registration.waiting) {
    onWaiting(registration.waiting);
  }

  const onUpdateFound = () => {
    const installing = registration.installing;
    if (!installing) return;
    const onStateChange = () => {
      if (installing.state === "installed" && navigator.serviceWorker.controller) {
        onWaiting(installing);
      }
    };
    installing.addEventListener("statechange", onStateChange);
  };

  registration.addEventListener("updatefound", onUpdateFound);

  return () => {
    registration.removeEventListener("updatefound", onUpdateFound);
  };
}
