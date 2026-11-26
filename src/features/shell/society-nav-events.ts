export const SOCIETY_NAV_OPEN_EVENT = "hb-society-nav-open";

export function requestSocietyNavOpen(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SOCIETY_NAV_OPEN_EVENT));
}

export function isSocietyAppPath(pathname: string): boolean {
  const match = pathname.match(/^\/societies\/([^/]+)/);
  if (!match) return false;
  return match[1] !== "new";
}
