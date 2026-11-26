export const SOCIETY_CONTEXT_EVENT = "hb-society-context";

export type SocietyContextDetail = {
  id: string;
  name: string;
} | null;

export function publishSocietyContext(detail: SocietyContextDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SocietyContextDetail>(SOCIETY_CONTEXT_EVENT, { detail }),
  );
}
