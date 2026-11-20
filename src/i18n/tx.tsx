"use client";

import { useI18n } from "@/i18n/provider";

export function Tx({ k }: { k: string }) {
  const { t } = useI18n();
  return t(k);
}
