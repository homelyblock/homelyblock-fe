import type { AttentionCounts } from "@/features/dashboard/types";
import type { SocietyNavKey } from "./nav-items";

const ATTENTION_NAV: Partial<Record<SocietyNavKey, keyof AttentionCounts>> = {
  complaints: "complaints",
  members: "members",
  visitors: "visitors",
  notices: "notices",
  billing: "billing",
};

export function countForNav(
  key: SocietyNavKey,
  counts: AttentionCounts | undefined,
): number {
  const field = ATTENTION_NAV[key];
  if (!field || !counts) return 0;
  const value = counts[field];
  return Number.isFinite(value) && value > 0 ? value : 0;
}
